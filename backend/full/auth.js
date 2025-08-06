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

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  res.json(req.user);
});

export { router, authenticateToken, authorizeRoles };
