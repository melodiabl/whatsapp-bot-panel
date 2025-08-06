import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getDb } from './index.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const user = await db.get('SELECT id, username, rol FROM usuarios WHERE username = ?', [decoded.username]);
    
    if (!user) {
      return res.status(403).json({ error: 'Usuario no válido' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Middleware de autorización por roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    next();
  };
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const db = getDb();
    const user = await db.get('SELECT * FROM usuarios WHERE username = ?', [username]);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ username: user.username, rol: user.rol }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        rol: user.rol
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register (solo admin y owner)
router.post('/register', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const { username, password, rol } = req.body;

    if (!username || !password || !rol) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (!['admin', 'colaborador', 'usuario', 'owner'].includes(rol)) {
      return res.status(400).json({ error: 'Rol no válido' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const db = getDb();
    
    const stmt = await db.prepare(
      'INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)'
    );
    await stmt.run(username, hashedPassword, rol);
    await stmt.finalize();

    res.json({ success: true, message: 'Usuario creado correctamente' });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Auto-register desde WhatsApp (sin autenticación)
router.post('/auto-register', async (req, res) => {
  try {
    const { whatsapp_number, username, grupo_jid } = req.body;

    if (!whatsapp_number || !username || !grupo_jid) {
      return res.status(400).json({ error: 'Número de WhatsApp, username y grupo son requeridos' });
    }

    // Verificar que el grupo esté autorizado
    const db = getDb();
    const grupoAutorizado = await db.get('SELECT * FROM grupos_autorizados WHERE jid = ?', [grupo_jid]);
    
    if (!grupoAutorizado) {
      return res.status(403).json({ error: 'Grupo no autorizado para registro automático' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.get('SELECT * FROM usuarios WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }

    // Generar contraseña temporal
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    const stmt = await db.prepare(
      'INSERT INTO usuarios (username, password, rol, whatsapp_number, grupo_registro, fecha_registro) VALUES (?, ?, ?, ?, ?, ?)'
    );
    await stmt.run(username, hashedPassword, 'usuario', whatsapp_number, grupo_jid, new Date().toISOString());
    await stmt.finalize();

    res.json({ 
      success: true, 
      message: 'Usuario registrado correctamente',
      tempPassword: tempPassword,
      username: username
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { whatsapp_number, username } = req.body;

    if (!whatsapp_number || !username) {
      return res.status(400).json({ error: 'Número de WhatsApp y username son requeridos' });
    }

    const db = getDb();
    const user = await db.get('SELECT * FROM usuarios WHERE username = ? AND whatsapp_number = ?', [username, whatsapp_number]);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado o número de WhatsApp no coincide' });
    }

    // Generar nueva contraseña temporal
    const newTempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newTempPassword, 10);
    
    const stmt = await db.prepare('UPDATE usuarios SET password = ? WHERE id = ?');
    await stmt.run(hashedPassword, user.id);
    await stmt.finalize();

    res.json({ 
      success: true, 
      message: 'Contraseña restablecida correctamente',
      tempPassword: newTempPassword,
      username: username
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password (usuario autenticado)
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva contraseña son requeridas' });
    }

    const db = getDb();
    const user = await db.get('SELECT * FROM usuarios WHERE username = ?', [req.user.username]);
    
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const stmt = await db.prepare('UPDATE usuarios SET password = ? WHERE id = ?');
    await stmt.run(hashedPassword, user.id);
    await stmt.finalize();

    res.json({ success: true, message: 'Contraseña cambiada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  res.json(req.user);
});

export { router, authenticateToken, authorizeRoles };
