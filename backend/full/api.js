import express from 'express';
import { getDb } from './index.js';
import { authenticateToken, authorizeRoles } from './auth.js';
import { getQRCode, getQRCodeImage, getConnectionStatus, getAvailableGroups } from './whatsapp.js';

const router = express.Router();

// Helper function to get database instance
const getDatabase = () => {
  const db = getDb();
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

// Get votaciones
router.get('/votaciones', async (req, res) => {
  try {
    const db = getDatabase();
    const votaciones = await db.all('SELECT * FROM votaciones');
    res.json(votaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get manhwas
router.get('/manhwas', async (req, res) => {
  try {
    const db = getDatabase();
    const manhwas = await db.all('SELECT * FROM manhwas');
    res.json(manhwas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get aportes
router.get('/aportes', async (req, res) => {
  try {
    const db = getDatabase();
    const aportes = await db.all('SELECT * FROM aportes ORDER BY fecha DESC');
    res.json(aportes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pedidos
router.get('/pedidos', async (req, res) => {
  try {
    const db = getDatabase();
    const pedidos = await db.all('SELECT * FROM pedidos ORDER BY fecha DESC');
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get logs
router.get('/logs', async (req, res) => {
  try {
    const db = getDatabase();
    const logs = await db.all('SELECT * FROM logs ORDER BY fecha DESC LIMIT 100');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get grupos autorizados
router.get('/grupos', async (req, res) => {
  try {
    const db = getDatabase();
    const grupos = await db.all('SELECT * FROM grupos_autorizados');
    res.json(grupos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const db = getDatabase();
    const usuarios = await db.all('SELECT id, username, rol FROM usuarios');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD para Votaciones
router.post('/votaciones', authenticateToken, authorizeRoles('admin', 'owner', 'colaborador'), async (req, res) => {
  try {
    const db = getDatabase();
    const { titulo, descripcion, opciones, fecha_fin } = req.body;
    const fecha_inicio = new Date().toISOString();
    const creador = req.user.username;
    
    const stmt = await db.prepare(
      'INSERT INTO votaciones (titulo, descripcion, opciones, fecha_inicio, fecha_fin, estado, creador) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    await stmt.run(titulo, descripcion, JSON.stringify(opciones), fecha_inicio, fecha_fin, 'activa', creador);
    await stmt.finalize();
    
    res.json({ success: true, message: 'Votación creada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/votaciones/:id', authenticateToken, authorizeRoles('admin', 'owner', 'colaborador'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { titulo, descripcion, opciones, fecha_fin, estado } = req.body;
    
    const stmt = await db.prepare(
      'UPDATE votaciones SET titulo = ?, descripcion = ?, opciones = ?, fecha_fin = ?, estado = ? WHERE id = ?'
    );
    await stmt.run(titulo, descripcion, JSON.stringify(opciones), fecha_fin, estado, id);
    await stmt.finalize();
    
    res.json({ success: true, message: 'Votación actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/votaciones/:id', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    
    await db.run('DELETE FROM votos WHERE votacion_id = ?', [id]);
    await db.run('DELETE FROM votaciones WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Votación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD para Manhwas
router.post('/manhwas', authenticateToken, authorizeRoles('admin', 'owner', 'colaborador'), async (req, res) => {
  try {
    const db = getDatabase();
    const { titulo, autor, genero, estado, descripcion, url, proveedor } = req.body;
    const fecha_registro = new Date().toISOString();
    const usuario_registro = req.user.username;
    
    const stmt = await db.prepare(
      'INSERT INTO manhwas (titulo, autor, genero, estado, descripcion, url, proveedor, fecha_registro, usuario_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    await stmt.run(titulo, autor, genero, estado, descripcion, url, proveedor, fecha_registro, usuario_registro);
    await stmt.finalize();
    
    res.json({ success: true, message: 'Manhwa agregado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/manhwas/:id', authenticateToken, authorizeRoles('admin', 'owner', 'colaborador'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { titulo, autor, genero, estado, descripcion, url, proveedor } = req.body;
    
    const stmt = await db.prepare(
      'UPDATE manhwas SET titulo = ?, autor = ?, genero = ?, estado = ?, descripcion = ?, url = ?, proveedor = ? WHERE id = ?'
    );
    await stmt.run(titulo, autor, genero, estado, descripcion, url, proveedor, id);
    await stmt.finalize();
    
    res.json({ success: true, message: 'Manhwa actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/manhwas/:id', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    
    await db.run('DELETE FROM manhwas WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Manhwa eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create aporte (para usuarios)
router.post('/aportes', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const { contenido, tipo, grupo } = req.body;
    const fecha = new Date().toISOString();
    const usuario = req.user.username;
    
    const stmt = await db.prepare(
      'INSERT INTO aportes (contenido, tipo, usuario, grupo, fecha) VALUES (?, ?, ?, ?, ?)'
    );
    await stmt.run(contenido, tipo, usuario, grupo, fecha);
    await stmt.finalize();
    
    res.json({ success: true, message: 'Aporte creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/aportes/:id', authenticateToken, authorizeRoles('admin', 'owner', 'colaborador'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    
    await db.run('DELETE FROM aportes WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Aporte eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create pedido (para usuarios)
router.post('/pedidos', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const { texto, grupo } = req.body;
    const fecha = new Date().toISOString();
    const usuario = req.user.username;
    
    const stmt = await db.prepare(
      'INSERT INTO pedidos (texto, estado, usuario, grupo, fecha) VALUES (?, ?, ?, ?, ?)'
    );
    await stmt.run(texto, 'pendiente', usuario, grupo, fecha);
    await stmt.finalize();
    
    res.json({ success: true, message: 'Pedido creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/pedidos/:id', authenticateToken, authorizeRoles('admin', 'owner', 'colaborador'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { estado } = req.body;
    
    const stmt = await db.prepare('UPDATE pedidos SET estado = ? WHERE id = ?');
    await stmt.run(estado, id);
    await stmt.finalize();
    
    res.json({ success: true, message: 'Estado del pedido actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/pedidos/:id', authenticateToken, authorizeRoles('admin', 'owner', 'colaborador'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    
    await db.run('DELETE FROM pedidos WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Pedido eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD para Grupos
router.post('/grupos', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const db = getDatabase();
    const { jid, nombre, tipo, proveedor, min_messages, max_warnings, enable_warnings, enable_restriction } = req.body;
    
    const stmt = await db.prepare(
      'INSERT INTO grupos_autorizados (jid, nombre, tipo, proveedor, min_messages, max_warnings, enable_warnings, enable_restriction) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    await stmt.run(jid, nombre, tipo, proveedor || 'General', min_messages || 100, max_warnings || 3, enable_warnings !== false, enable_restriction !== false);
    await stmt.finalize();
    
    res.json({ success: true, message: 'Grupo autorizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/grupos/:jid', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const db = getDatabase();
    const { jid } = req.params;
    const { nombre, tipo, proveedor, min_messages, max_warnings, enable_warnings, enable_restriction } = req.body;
    
    const stmt = await db.prepare(
      'UPDATE grupos_autorizados SET nombre = ?, tipo = ?, proveedor = ?, min_messages = ?, max_warnings = ?, enable_warnings = ?, enable_restriction = ? WHERE jid = ?'
    );
    await stmt.run(nombre, tipo, proveedor, min_messages, max_warnings, enable_warnings, enable_restriction, jid);
    await stmt.finalize();
    
    res.json({ success: true, message: 'Grupo actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/grupos/:jid', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const db = getDatabase();
    const { jid } = req.params;
    
    await db.run('DELETE FROM grupos_autorizados WHERE jid = ?', [jid]);
    
    res.json({ success: true, message: 'Grupo desautorizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Dashboard stats endpoint
router.get('/dashboard/stats', async (req, res) => {
  try {
    const db = getDatabase();
    const usuariosCount = await db.get('SELECT COUNT(*) as count FROM usuarios');
    const aportesCount = await db.get('SELECT COUNT(*) as count FROM aportes');
    const pedidosCount = await db.get('SELECT COUNT(*) as count FROM pedidos');
    const gruposCount = await db.get('SELECT COUNT(*) as count FROM grupos_autorizados');
    const votacionesCount = await db.get('SELECT COUNT(*) as count FROM votaciones');
    const manhwasCount = await db.get('SELECT COUNT(*) as count FROM manhwas');

    res.json({
      usuarios: usuariosCount.count,
      aportes: aportesCount.count,
      pedidos: pedidosCount.count,
      grupos: gruposCount.count,
      votaciones: votacionesCount.count,
      manhwas: manhwasCount.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gestión de usuarios (solo admin y owner)
router.delete('/usuarios/:id', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    
    await db.run('DELETE FROM usuarios WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/usuarios/:id', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { rol } = req.body;
    
    if (!['admin', 'colaborador', 'usuario', 'owner'].includes(rol)) {
      return res.status(400).json({ error: 'Rol no válido' });
    }
    
    const stmt = await db.prepare('UPDATE usuarios SET rol = ? WHERE id = ?');
    await stmt.run(rol, id);
    await stmt.finalize();
    
    res.json({ success: true, message: 'Rol de usuario actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WhatsApp Bot endpoints
router.get('/whatsapp/status', async (req, res) => {
  try {
    const status = getConnectionStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/whatsapp/qr', async (req, res) => {
  try {
    const qrCode = getQRCode();
    const qrCodeImage = getQRCodeImage();
    
    if (!qrCode && !qrCodeImage) {
      return res.json({ 
        available: false, 
        message: 'No hay código QR disponible' 
      });
    }
    
    res.json({
      available: true,
      qrCode: qrCode,
      qrCodeImage: qrCodeImage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/whatsapp/groups', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const groups = await getAvailableGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
