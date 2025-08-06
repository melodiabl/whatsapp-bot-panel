import * as baileys from '@whiskeysockets/baileys';
const { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = baileys;
import { Boom } from '@hapi/boom';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import QRCode from 'qrcode';
import { db } from './index.js';
import { 
  handleHelp,
  handleIA,
  handleMyAportes,
  handleAportes,
  handleManhwas,
  handleSeries,
  handleAddAporte,
  handleAddSerie,
  handlePedido,
  handlePedidos,
  handleExtra,
  handleIlustraciones,
  handleAddGroup,
  handleDelGroup,
  handleAddManhwa,
  handleLogs,
  handlePrivado,
  handleAmigos,
  handleAdvertencias,
  handleVotar,
  handleCrearVotacion,
  handleCerrarVotacion,
  handleObtenerManhwa,
  handleObtenerExtra,
  handleObtenerIlustracion,
  handleObtenerPack,
  handleBan,
  handleUnban
} from './commands-complete.js';

let sock;
let qrCode = null;
let qrCodeImage = null;
let connectionStatus = 'disconnected';
let lastConnection = null;
let connectionStartTime = null;

// Registrar logs en la base de datos
async function logCommand(tipo, comando, usuario, grupo) {
  try {
    const fecha = new Date().toISOString();
    const stmt = await db.prepare(
      'INSERT INTO logs (tipo, comando, usuario, grupo, fecha) VALUES (?, ?, ?, ?, ?)'
    );
    await stmt.run(tipo, comando, usuario, grupo, fecha);
    await stmt.finalize();
  } catch (error) {
    console.error('Error al registrar log:', error);
  }
}

// Verificar si un usuario está baneado
async function isUserBanned(usuario) {
  try {
    const banned = await db.get('SELECT * FROM baneados WHERE usuario = ?', [usuario]);
    return !!banned;
  } catch (error) {
    console.error('Error al verificar usuario baneado:', error);
    return false;
  }
}

// Verificar si un grupo está autorizado
async function isGroupAuthorized(grupoId) {
  try {
    const grupo = await db.get('SELECT * FROM grupos_autorizados WHERE jid = ?', [grupoId]);
    return !!grupo;
  } catch (error) {
    console.error('Error al verificar grupo autorizado:', error);
    return false;
  }
}

// Manejar mensajes entrantes
async function handleMessage(message) {
  if (!message.message || !message.key.remoteJid) return;

  const messageText = message.message.conversation ||
    message.message.extendedTextMessage?.text || '';

  if (!messageText.startsWith('/') && !messageText.startsWith('!')) return;

  const remoteJid = message.key.remoteJid;
  const isGroup = remoteJid.endsWith('@g.us');
  const sender = message.key.participant || remoteJid;
  const usuario = sender.split('@')[0];
  const grupo = isGroup ? remoteJid : null;

  if (await isUserBanned(usuario)) {
    await sock.sendMessage(remoteJid, {
      text: '🚫 Estás baneado y no puedes usar comandos.'
    });
    return;
  }

  const parts = messageText.trim().split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Solo verificar autorización de grupo para comandos que lo requieren
  const requiresAuth = ['/aportes'];
  if (isGroup && requiresAuth.includes(command) && !(await isGroupAuthorized(remoteJid))) {
    return;
  }

  console.log(`Comando recibido: ${command} de ${usuario}`);

  let result;
  const fecha = new Date().toISOString();

  switch (command) {
    // Comandos básicos - múltiples variantes para help/menu
    case '/help':
    case '/ayuda':
    case '/menu':
    case '!help':
    case '!menu':
      result = await handleHelp(usuario, grupo, isGroup);
      break;

    case '/ia':
      if (args.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /ia <pregunta>' });
        return;
      }
      result = await handleIA(args.join(' '), usuario, grupo);
      break;

    case '/myaportes':
      result = await handleMyAportes(usuario, grupo);
      break;

    case '/aportes':
      result = await handleAportes(usuario, grupo, isGroup);
      break;

    case '/manhwas':
      result = await handleManhwas(usuario, grupo);
      break;

    case '/series':
      result = await handleSeries(usuario, grupo);
      break;

    case '/addserie':
      if (args.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /addserie <título|género|estado|descripción>' });
        return;
      }
      result = await handleAddSerie(args.join(' '), usuario, grupo, fecha);
      break;

    case '/addaporte':
      if (args.length < 2) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /addaporte <tipo> <contenido>' });
        return;
      }
      const tipo = args[0];
      const contenido = args.slice(1).join(' ');
      result = await handleAddAporte(contenido, tipo, usuario, grupo, fecha);
      break;

    case '/pedido':
      if (args.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /pedido <contenido que buscas>' });
        return;
      }
      result = await handlePedido(args.join(' '), usuario, grupo, fecha);
      break;

    case '/pedidos':
      result = await handlePedidos(usuario, grupo);
      break;

    case '/extra':
      if (args.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /extra <nombre>' });
        return;
      }
      result = await handleExtra(args.join(' '), usuario, grupo, fecha);
      break;

    case '/ilustraciones':
      result = await handleIlustraciones(usuario, grupo);
      break;

    // Comandos de administración
    case '/addgroup':
      const groupName = args.join(' ') || 'Grupo Autorizado';
      result = await handleAddGroup(usuario, grupo, groupName);
      break;

    case '/delgroup':
      result = await handleDelGroup(usuario, grupo);
      break;

    case '/addmanhwa':
      if (args.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /addmanhwa <título|autor|género|estado|descripción|url|proveedor>' });
        return;
      }
      result = await handleAddManhwa(args.join(' '), usuario, grupo);
      break;

    case '/logs':
      result = await handleLogs(usuario, grupo);
      break;

    case '/privado':
      result = await handlePrivado(usuario, grupo);
      break;

    case '/amigos':
      result = await handleAmigos(usuario, grupo);
      break;

    case '/advertencias':
      if (args.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /advertencias <on|off>' });
        return;
      }
      result = await handleAdvertencias(args[0], usuario, grupo);
      break;

    // Comandos de votación
    case '/votar':
      if (args.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /votar <opción>' });
        return;
      }
      result = await handleVotar(args.join(' '), usuario, grupo);
      break;

    case '/crearvotacion':
      if (args.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /crearvotacion <pregunta | opción1 | opción2 | ...>' });
        return;
      }
      result = await handleCrearVotacion(args.join(' '), usuario, grupo);
      break;

    case '/cerrarvotacion':
      if (args.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /cerrarvotacion <ID>' });
        return;
      }
      result = await handleCerrarVotacion(args[0], usuario, grupo);
      break;

    // Comandos de obtención desde grupos proveedor
    case '/obtenermanhwa':
      if (args.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /obtenermanhwa <nombre>' });
        return;
      }
      result = await handleObtenerManhwa(args.join(' '), usuario, grupo);
      break;

    case '/obtenerextra':
      if (args.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /obtenerextra <nombre>' });
        return;
      }
      result = await handleObtenerExtra(args.join(' '), usuario, grupo);
      break;

    case '/obtenerilustracion':
      if (args.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /obtenerilustracion <nombre>' });
        return;
      }
      result = await handleObtenerIlustracion(args.join(' '), usuario, grupo);
      break;

    case '/obtenerpack':
      if (args.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /obtenerpack <nombre>' });
        return;
      }
      result = await handleObtenerPack(args.join(' '), usuario, grupo);
      break;

    // Comandos de moderación
    case '/ban':
      if (args.length < 2) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /ban @usuario <motivo>' });
        return;
      }
      const usuarioBan = args[0].replace('@', '');
      const motivoBan = args.slice(1).join(' ');
      result = await handleBan(usuarioBan, motivoBan, fecha);
      break;

    case '/unban':
      if (args.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'Uso: /unban @usuario' });
        return;
      }
      const usuarioUnban = args[0].replace('@', '');
      result = await handleUnban(usuarioUnban);
      break;

    // Comando de estado (legacy)
    case '/estado':
      await sock.sendMessage(remoteJid, {
        text: `*Estado del Bot:*\nEstado: ${connectionStatus}\nUsuario: ${usuario}${isGroup ? `\nGrupo: ${grupo}` : ''}`
      });
      return;

    default:
      await sock.sendMessage(remoteJid, {
        text: '❓ Comando no reconocido. Usa /help para ver los comandos disponibles.'
      });
      return;
  }

  // Enviar respuesta si hay resultado
  if (result && result.message) {
    await sock.sendMessage(remoteJid, { text: result.message });
  }
}

// Conectar a WhatsApp con reconexión automática mejorada
async function connectToWhatsApp(authPath) {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`🔄 Usando WA v${version.join('.')}, ¿es la última? ${isLatest}`);

    sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false, // Desactivamos QR en terminal, solo en panel
      auth: state,
      browser: ['Bot WhatsApp Panel', 'Desktop', '2.5.0'],
      keepAliveIntervalMs: 30000, // Keep alive cada 30 segundos
      connectTimeoutMs: 60000, // Timeout de conexión 60 segundos
      defaultQueryTimeoutMs: 60000, // Timeout de query 60 segundos
      markOnlineOnConnect: true, // Marcar como online al conectar
      syncFullHistory: false, // No sincronizar historial completo
      generateHighQualityLinkPreview: false, // No generar previews de alta calidad
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr, receivedPendingNotifications } = update;

      if (qr) {
        qrCode = qr;
        connectionStatus = 'waiting_for_scan';
        try {
          // Generar imagen QR en base64 con mejor calidad
          qrCodeImage = await QRCode.toDataURL(qr, {
            errorCorrectionLevel: 'H', // Alta corrección de errores
            type: 'image/png',
            quality: 0.95,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            width: 300 // Tamaño más grande para mejor escaneo
          });
          console.log('📱 QR Code generado y disponible en el panel');
        } catch (error) {
          console.error('❌ Error generando imagen QR:', error);
        }
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        
        console.log(`⚠️ Conexión cerrada. Código: ${statusCode}, Reconectar: ${shouldReconnect}`);

        connectionStatus = 'disconnected';
        qrCode = null;
        qrCodeImage = null;

        if (shouldReconnect) {
          // Reconexión con backoff exponencial
          const delay = statusCode === DisconnectReason.restartRequired ? 1000 : 5000;
          console.log(`🔄 Reconectando en ${delay}ms...`);
          setTimeout(() => connectToWhatsApp(authPath), delay);
        } else {
          console.log('🚫 No se reconectará automáticamente');
        }
      } else if (connection === 'connecting') {
        connectionStatus = 'connecting';
        console.log('🔄 Conectando a WhatsApp...');
      } else if (connection === 'open') {
        console.log('✅ Bot conectado exitosamente a WhatsApp');
        connectionStatus = 'connected';
        lastConnection = new Date();
        connectionStartTime = new Date();
        qrCode = null;
        qrCodeImage = null;
        
        // Registrar conexión exitosa en logs
        await logCommand('sistema', 'conexion_exitosa', 'bot', null);
      }

      if (receivedPendingNotifications) {
        console.log('📬 Notificaciones pendientes recibidas');
      }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
      const message = m.messages[0];
      if (!message.key.fromMe && message.message) {
        try {
          await handleMessage(message);
        } catch (error) {
          console.error('❌ Error procesando mensaje:', error);
        }
      }
    });

    sock.ev.on('group-participants.update', async (update) => {
      console.log('👥 Actualización de participantes en grupo:', update.id);
      // Aquí se puede agregar lógica para manejar cambios en grupos
    });

    // Manejar errores de conexión
    sock.ev.on('connection.error', (error) => {
      console.error('❌ Error de conexión:', error);
    });

    return sock;
  } catch (error) {
    console.error('❌ Error crítico al conectar WhatsApp:', error);
    connectionStatus = 'error';
    throw error;
  }
}

function getQRCode() {
  return qrCode;
}

function getQRCodeImage() {
  return qrCodeImage;
}

function getConnectionStatus() {
  const now = new Date();
  let uptime = null;
  let lastConnectionText = null;
  
  if (connectionStartTime && connectionStatus === 'connected') {
    const uptimeMs = now - connectionStartTime;
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    uptime = `${hours}h ${minutes}m`;
  }
  
  if (lastConnection) {
    const timeDiff = now - lastConnection;
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (connectionStatus === 'connected') {
      lastConnectionText = 'Conectado ahora';
    } else if (days > 0) {
      lastConnectionText = `hace ${days} día${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      lastConnectionText = `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      lastConnectionText = `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else {
      lastConnectionText = 'hace menos de 1 minuto';
    }
  } else {
    lastConnectionText = 'Nunca conectado';
  }
  
  return {
    status: connectionStatus,
    lastConnection: lastConnectionText,
    uptime: uptime,
    isConnected: connectionStatus === 'connected',
    timestamp: now.toISOString()
  };
}

function getSocket() {
  return sock;
}

// Obtener grupos disponibles del bot
async function getAvailableGroups() {
  try {
    if (!sock || connectionStatus !== 'connected') {
      return [];
    }

    // Obtener todos los chats
    const chats = await sock.groupFetchAllParticipating();
    const groups = [];

    for (const [jid, group] of Object.entries(chats)) {
      if (jid.endsWith('@g.us')) {
        groups.push({
          jid: jid,
          nombre: group.subject || 'Grupo sin nombre',
          descripcion: group.desc || '',
          participantes: group.participants ? group.participants.length : 0,
          esAdmin: group.participants ? group.participants.some(p => 
            p.id === sock.user.id && (p.admin === 'admin' || p.admin === 'superadmin')
          ) : false
        });
      }
    }

    return groups;
  } catch (error) {
    console.error('Error obteniendo grupos disponibles:', error);
    return [];
  }
}

export { connectToWhatsApp, getQRCode, getQRCodeImage, getConnectionStatus, getSocket, getAvailableGroups };
