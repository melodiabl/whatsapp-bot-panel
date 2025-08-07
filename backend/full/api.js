import express from 'express';
import db from './db.js';
import { authenticateToken, authorizeRoles } from './auth.js';
import { getQRCode, getQRCodeImage, getConnectionStatus, getAvailableGroups } from './whatsapp.js';
import {
  getProviderStats,
  getProviderAportes
} from './auto-provider-handler.js';

const router = express.Router();

// Get votaciones
router.get('/votaciones', async (req, res) => {
  try {
    const votaciones = await db('votaciones').select('*');
    res.json(votaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get manhwas
router.get('/manhwas', async (req, res) => {
  try {
    const manhwas = await db('manhwas').select('*');
    res.json(manhwas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get aportes
router.get('/aportes', async (req, res) => {
  try {
    const aportes = await db('aportes').select('*').orderBy('fecha', 'desc');
    res.json(aportes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pedidos
router.get('/pedidos', async (req, res) => {
  try {
    const pedidos = await db('pedidos').select('*').orderBy('fecha', 'desc');
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get logs with filtering
router.get('/logs', async (req, res) => {
  try {
    const { tipo, limit = 100 } = req.query;
    
    let query = db('logs').select('*');
    
    if (tipo) {
      query = query.where({ tipo });
    }
    
    const logs = await query.orderBy('fecha', 'desc').limit(parseInt(limit));
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get logs by category
router.get('/logs/categoria/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;
    const { limit = 50 } = req.query;
    
    const logs = await db('logs')
      .where({ tipo: categoria })
      .orderBy('fecha', 'desc')
      .limit(parseInt(limit));
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get log statistics
router.get('/logs/stats', async (req, res) => {
  try {
    const stats = await db('logs')
      .select('tipo')
      .count('* as cantidad')
      .max('fecha as ultimo_registro')
      .groupBy('tipo')
      .orderBy('cantidad', 'desc');
    
    const total = await db('logs').count('* as total').first();
    
    res.json({
      total: total.total,
      por_categoria: stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create log entry (for control and configuration)
router.post('/logs', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const { tipo, comando, detalles } = req.body;
    const fecha = new Date();
    const usuario = req.user.username;
    
    // Validar tipos permitidos
    const tiposPermitidos = ['control', 'configuracion', 'sistema', 'comando', 'ai_command', 'clasificar_command', 'administracion'];
    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de log no válido' });
    }
    
    await db('logs').insert({
      tipo,
      comando,
      usuario,
      grupo: null,
      fecha,
      detalles: detalles || null
    });
    
    res.json({ success: true, message: 'Log registrado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get grupos autorizados
router.get('/grupos', async (req, res) => {
  try {
    const grupos = await db('grupos_autorizados').select('*');
    res.json(grupos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await db('usuarios').select('id', 'username', 'rol', 'whatsapp_number', 'grupo_registro', 'fecha_registro');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD para Votaciones
router.post('/votaciones', authenticateToken, authorizeRoles('admin', 'owner', 'colaborador'), async (req, res) => {
  try {
    const { titulo, descripcion, opciones, fecha_fin } = req.body;
    const fecha_inicio = new Date();
    const creador = req.user.username;
    
    await db('votaciones').insert({
      titulo,
      descripcion,
      opciones: JSON.stringify(opciones),
      fecha_inicio,
      fecha_fin,
      estado: 'activa',
      creador
    });
    
    res.json({ success: true, message: 'Votación creada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/votaciones/:id', authenticateToken, authorizeRoles('admin', 'owner', 'colaborador'), async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, opciones, fecha_fin, estado } = req.body;
    
    await db('votaciones').where({ id }).update({
      titulo,
      descripcion,
      opciones: JSON.stringify(opciones),
      fecha_fin,
      estado
    });
    
    res.json({ success: true, message: 'Votación actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/votaciones/:id', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await db('votos').where({ votacion_id: id }).del();
    await db('votaciones').where({ id }).del();
    
    res.json({ success: true, message: 'Votación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD para Manhwas
router.post('/manhwas', authenticateToken, authorizeRoles('admin', 'owner', 'colaborador'), async (req, res) => {
  try {
    const { titulo, autor, genero, estado, descripcion, url, proveedor } = req.body;
    const fecha_registro = new Date();
    const usuario_registro = req.user.username;
    
    await db('manhwas').insert({
      titulo,
      autor,
      genero,
      estado,
      descripcion,
      url,
      proveedor,
      fecha_registro,
      usuario_registro
    });
    
    res.json({ success: true, message: 'Manhwa agregado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/manhwas/:id', authenticateToken, authorizeRoles('admin', 'owner', 'colaborador'), async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, autor, genero, estado, descripcion, url, proveedor } = req.body;
    
    await db('manhwas').where({ id }).update({
      titulo,
      autor,
      genero,
      estado,
      descripcion,
      url,
      proveedor
    });
    
    res.json({ success: true, message: 'Manhwa actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/manhwas/:id', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await db('manhwas').where({ id }).del();
    
    res.json({ success: true, message: 'Manhwa eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create aporte (para usuarios)
router.post('/aportes', authenticateToken, async (req, res) => {
  try {
    const { contenido, tipo, grupo } = req.body;
    const fecha = new Date();
    const usuario = req.user.username;
    
    await db('aportes').insert({
      contenido,
      tipo,
      usuario,
      grupo,
      fecha
    });
    
    res.json({ success: true, message: 'Aporte creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/aportes/:id', authenticateToken, authorizeRoles('admin', 'owner', 'colaborador'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await db('aportes').where({ id }).del();
    
    res.json({ success: true, message: 'Aporte eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create pedido (para usuarios)
router.post('/pedidos', authenticateToken, async (req, res) => {
  try {
    const { texto, grupo } = req.body;
    const fecha = new Date();
    const usuario = req.user.username;
    
    await db('pedidos').insert({
      texto,
      estado: 'pendiente',
      usuario,
      grupo,
      fecha
    });
    
    res.json({ success: true, message: 'Pedido creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/pedidos/:id', authenticateToken, authorizeRoles('admin', 'owner', 'colaborador'), async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    await db('pedidos').where({ id }).update({ estado });
    
    res.json({ success: true, message: 'Estado del pedido actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/pedidos/:id', authenticateToken, authorizeRoles('admin', 'owner', 'colaborador'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await db('pedidos').where({ id }).del();
    
    res.json({ success: true, message: 'Pedido eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD para Grupos
router.post('/grupos', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const { jid, nombre, tipo, proveedor, min_messages, max_warnings, enable_warnings, enable_restriction } = req.body;
    
    await db('grupos_autorizados').insert({
      jid,
      nombre,
      tipo,
      proveedor: proveedor || 'General',
      min_messages: min_messages || 100,
      max_warnings: max_warnings || 3,
      enable_warnings: enable_warnings !== false,
      enable_restriction: enable_restriction !== false
    });
    
    res.json({ success: true, message: 'Grupo autorizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/grupos/:jid', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const { jid } = req.params;
    const { nombre, tipo, proveedor, min_messages, max_warnings, enable_warnings, enable_restriction } = req.body;
    
    await db('grupos_autorizados').where({ jid }).update({
      nombre,
      tipo,
      proveedor,
      min_messages,
      max_warnings,
      enable_warnings,
      enable_restriction
    });
    
    res.json({ success: true, message: 'Grupo actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/grupos/:jid', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const { jid } = req.params;
    
    await db('grupos_autorizados').where({ jid }).del();
    
    res.json({ success: true, message: 'Grupo desautorizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard stats endpoint
router.get('/dashboard/stats', async (req, res) => {
  try {
    const usuariosCount = await db('usuarios').count('id as count').first();
    const aportesCount = await db('aportes').count('id as count').first();
    const pedidosCount = await db('pedidos').count('id as count').first();
    const gruposCount = await db('grupos_autorizados').count('id as count').first();
    const votacionesCount = await db('votaciones').count('id as count').first();
    const manhwasCount = await db('manhwas').count('id as count').first();

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
    const { id } = req.params;
    
    await db('usuarios').where({ id }).del();
    
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/usuarios/:id', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    
    if (!['admin', 'colaborador', 'usuario', 'owner'].includes(rol)) {
      return res.status(400).json({ error: 'Rol no válido' });
    }
    
    await db('usuarios').where({ id }).update({ rol });
    
    res.json({ success: true, message: 'Rol de usuario actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edición completa de usuario (admin/owner)
router.put('/usuarios/:id/full-edit', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, rol, whatsapp_number } = req.body;
    
    if (!username || !rol) {
      return res.status(400).json({ error: 'Username y rol son requeridos' });
    }
    
    if (!['admin', 'colaborador', 'usuario', 'owner'].includes(rol)) {
      return res.status(400).json({ error: 'Rol no válido' });
    }
    
    // Verificar que el nuevo username no exista (si se está cambiando)
    const currentUser = await db('usuarios').where({ id }).select('username').first();
    if (currentUser.username !== username) {
      const existingUser = await db('usuarios').where({ username }).whereNot({ id }).first();
      if (existingUser) {
        return res.status(400).json({ error: 'El nombre de usuario ya existe' });
      }
    }
    
    await db('usuarios').where({ id }).update({
      username,
      rol,
      whatsapp_number: whatsapp_number || null
    });
    
    res.json({ success: true, message: 'Usuario actualizado completamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password de usuario (admin/owner)
router.post('/usuarios/:id/reset-password', authenticateToken, authorizeRoles('admin', 'owner'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Generar nueva contraseña temporal
    const newTempPassword = Math.random().toString(36).slice(-8);
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(newTempPassword, 10);
    
    await db('usuarios').where({ id }).update({ password: hashedPassword });
    
    res.json({ 
      success: true, 
      message: 'Contraseña restablecida correctamente',
      tempPassword: newTempPassword
    });
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
      qr: qrCodeImage || qrCode, // Para compatibilidad con frontend
      qrCode: qrCode,
      qrCodeImage: qrCodeImage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/whatsapp/logout', async (req, res) => {
  try {
    // Aquí podrías agregar lógica para desconectar el bot si es necesario
    // Por ahora solo devolvemos éxito
    res.json({ 
      success: true, 
      message: 'Bot desconectado correctamente' 
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

// Rutas para sistema de proveedores automático
router.get('/proveedores/estadisticas', authenticateToken, async (req, res) => {
  try {
    const stats = await getProviderStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/proveedores/aportes', authenticateToken, async (req, res) => {
  try {
    const filtros = {
      proveedor: req.query.proveedor || '',
      manhwa: req.query.manhwa || '',
      tipo: req.query.tipo || '',
      fecha_desde: req.query.fecha_desde || '',
      fecha_hasta: req.query.fecha_hasta || '',
      limit: parseInt(req.query.limit) || 100
    };
    
    const aportes = await getProviderAportes(filtros);
    res.json(aportes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/proveedores/download/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información del archivo
    const aporte = await db('aportes')
      .where({ id, tipo: 'proveedor_auto' })
      .select('archivo_path', 'manhwa_titulo')
      .first();
    
    if (!aporte) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    const fs = await import('fs');
    const path = await import('path');
    
    // Verificar si el archivo existe
    if (!fs.existsSync(aporte.archivo_path)) {
      return res.status(404).json({ error: 'Archivo no encontrado en el sistema' });
    }
    
    // Obtener información del archivo
    const fileName = path.basename(aporte.archivo_path);
    const fileStats = fs.statSync(aporte.archivo_path);
    
    // Configurar headers para descarga
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', fileStats.size);
    
    // Enviar archivo
    const fileStream = fs.createReadStream(aporte.archivo_path);
    fileStream.pipe(res);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
