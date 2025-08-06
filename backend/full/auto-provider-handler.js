import { db } from './index.js';
import { processWhatsAppMedia } from './file-manager.js';
import { analyzeProviderMessage } from './gemini-ai-handler.js';
import path from 'path';

/**
 * Sistema automático de procesamiento de aportes desde grupos proveedores
 */

/**
 * Detectar título de manhwa desde texto del mensaje
 */
function detectManhwaTitle(messageText, filename = '') {
  // Lista de títulos conocidos (se puede expandir)
  const knownTitles = [
    'jinx', 'painter of the night', 'killing stalking', 'bj alex',
    'cherry blossoms after winter', 'love is an illusion', 'warehouse',
    'sign', 'pearl boy', 'banana scandal', 'semantic error', 'viewfinder',
    'under the green light', 'define the relationship', 'love shuttle',
    'at the end of the road', 'walk on water', 'royal servant',
    'blood bank', 'ten count', 'given', 'doukyuusei', 'hitorijime my hero'
  ];

  const text = (messageText + ' ' + filename).toLowerCase();
  
  // Buscar títulos conocidos
  for (const title of knownTitles) {
    if (text.includes(title.toLowerCase())) {
      return title.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  }

  // Intentar extraer título de patrones comunes
  const patterns = [
    /(?:manhwa|manga|webtoon)[\s\-_]*([a-zA-Z\s]+?)[\s\-_]*(?:cap|chapter|ch|episodio|ep)/i,
    /([a-zA-Z\s]+?)[\s\-_]*(?:cap|chapter|ch|episodio|ep)[\s\-_]*\d+/i,
    /([a-zA-Z\s]{3,30})[\s\-_]*(?:extra|special|bonus)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  }

  return 'Desconocido';
}

/**
 * Detectar tipo de contenido
 */
function detectContentType(messageText, filename = '') {
  const text = (messageText + ' ' + filename).toLowerCase();
  
  // Patrones para diferentes tipos
  if (text.match(/(?:cap|chapter|ch|episodio|ep)[\s\-_]*\d+/i)) {
    return 'capítulo';
  }
  
  if (text.match(/(?:extra|special|bonus|omake|side)/i)) {
    return 'extra';
  }
  
  if (text.match(/(?:ilustr|art|fanart|cover|portada)/i)) {
    return 'ilustración';
  }
  
  if (text.match(/(?:pack|bundle|collection|vol|volume)/i)) {
    return 'pack';
  }

  // Detectar por extensión de archivo
  const extension = path.extname(filename).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
    return 'ilustración';
  }
  
  if (['.pdf', '.cbr', '.cbz'].includes(extension)) {
    return 'capítulo';
  }

  return 'desconocido';
}

/**
 * Obtener información del grupo proveedor
 */
async function getProviderInfo(groupJid) {
  try {
    const provider = await db.get(
      'SELECT * FROM grupos_autorizados WHERE jid = ? AND tipo = ?',
      [groupJid, 'proveedor']
    );
    return provider;
  } catch (error) {
    console.error('Error obteniendo info del proveedor:', error);
    return null;
  }
}

/**
 * Procesar mensaje automáticamente desde grupo proveedor
 */
async function processProviderMessage(message, groupJid, groupName) {
  try {
    // Verificar si es grupo proveedor
    const providerInfo = await getProviderInfo(groupJid);
    if (!providerInfo) {
      return null; // No es grupo proveedor
    }

    // Verificar si tiene media
    const hasMedia = message.message.imageMessage || 
                    message.message.videoMessage || 
                    message.message.documentMessage || 
                    message.message.audioMessage;

    if (!hasMedia) {
      return null; // No hay archivos para procesar
    }

    // Obtener texto del mensaje
    const messageText = message.message.conversation ||
                       message.message.extendedTextMessage?.text ||
                       message.message.imageMessage?.caption ||
                       message.message.videoMessage?.caption ||
                       message.message.documentMessage?.caption || '';

    // Obtener nombre del archivo si es documento
    const filename = message.message.documentMessage?.fileName || 
                    message.message.documentMessage?.title || '';

    // Usar IA de Gemini para análisis inteligente del contenido
    console.log(`🤖 Procesando con IA: "${messageText}" | Archivo: "${filename}"`);
    const aiAnalysis = await analyzeProviderMessage(messageText, filename, providerInfo.nombre || groupName);
    
    // Procesar y guardar el archivo
    const mediaResult = await processWhatsAppMedia(message, aiAnalysis.tipo, 'auto_provider');
    
    if (!mediaResult.success) {
      throw new Error('Error procesando media: ' + mediaResult.message);
    }

    // Usar datos del análisis de IA
    const manhwaTitle = aiAnalysis.titulo;
    const contentType = aiAnalysis.tipo;
    const descripcion = aiAnalysis.descripcion;
    const fecha = new Date().toISOString();

    // Guardar en tabla aportes
    const stmtAporte = await db.prepare(`
      INSERT INTO aportes (
        contenido, tipo, usuario, grupo, fecha, 
        archivo_path, archivo_size, proveedor, 
        manhwa_titulo, contenido_tipo, mensaje_original
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmtAporte.run(
      descripcion,
      'proveedor_auto',
      'sistema_auto',
      groupJid,
      fecha,
      mediaResult.filepath,
      mediaResult.size,
      providerInfo.nombre || groupName,
      manhwaTitle,
      contentType,
      JSON.stringify({
        messageText: messageText,
        filename: filename,
        mediaType: mediaResult.mediaType,
        originalMessage: {
          id: message.key.id,
          timestamp: message.messageTimestamp
        }
      })
    );

    await stmtAporte.finalize();

    // Registrar en logs
    await logProviderActivity('auto_procesado', descripcion, groupJid, providerInfo.nombre);

    console.log(`✅ Aporte automático procesado: ${descripcion} desde ${providerInfo.nombre}`);

    return {
      success: true,
      manhwaTitle,
      contentType,
      provider: providerInfo.nombre,
      filepath: mediaResult.filepath,
      size: mediaResult.size,
      description: descripcion
    };

  } catch (error) {
    console.error('Error procesando mensaje de proveedor:', error);
    
    // Registrar error en logs
    await logProviderActivity('error', error.message, groupJid, groupName);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Registrar actividad de proveedores en logs
 */
async function logProviderActivity(tipo, descripcion, groupJid, providerName) {
  try {
    const fecha = new Date().toISOString();
    const stmt = await db.prepare(
      'INSERT INTO logs (tipo, comando, usuario, grupo, fecha, detalles) VALUES (?, ?, ?, ?, ?, ?)'
    );
    await stmt.run(
      'proveedor',
      tipo,
      'sistema_auto',
      groupJid,
      fecha,
      JSON.stringify({
        descripcion,
        proveedor: providerName,
        timestamp: fecha
      })
    );
    await stmt.finalize();
  } catch (error) {
    console.error('Error registrando log de proveedor:', error);
  }
}

/**
 * Obtener estadísticas de aportes de proveedores
 */
async function getProviderStats() {
  try {
    const stats = await db.all(`
      SELECT 
        proveedor,
        manhwa_titulo,
        contenido_tipo,
        COUNT(*) as total,
        SUM(archivo_size) as total_size,
        MAX(fecha) as ultimo_aporte
      FROM aportes 
      WHERE tipo = 'proveedor_auto' 
      GROUP BY proveedor, manhwa_titulo, contenido_tipo
      ORDER BY ultimo_aporte DESC
    `);

    const resumen = await db.all(`
      SELECT 
        proveedor,
        COUNT(*) as total_aportes,
        SUM(archivo_size) as espacio_usado,
        COUNT(DISTINCT manhwa_titulo) as manhwas_diferentes
      FROM aportes 
      WHERE tipo = 'proveedor_auto' 
      GROUP BY proveedor
      ORDER BY total_aportes DESC
    `);

    return {
      detallado: stats,
      resumen: resumen
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de proveedores:', error);
    return { detallado: [], resumen: [] };
  }
}

/**
 * Obtener aportes de proveedores para el panel
 */
async function getProviderAportes(filtros = {}) {
  try {
    let query = `
      SELECT 
        id, contenido, manhwa_titulo, contenido_tipo, proveedor,
        archivo_path, archivo_size, fecha, mensaje_original,
        grupo
      FROM aportes 
      WHERE tipo = 'proveedor_auto'
    `;
    
    const params = [];

    // Aplicar filtros
    if (filtros.proveedor) {
      query += ' AND proveedor = ?';
      params.push(filtros.proveedor);
    }

    if (filtros.manhwa) {
      query += ' AND manhwa_titulo LIKE ?';
      params.push(`%${filtros.manhwa}%`);
    }

    if (filtros.tipo) {
      query += ' AND contenido_tipo = ?';
      params.push(filtros.tipo);
    }

    if (filtros.fecha_desde) {
      query += ' AND fecha >= ?';
      params.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      query += ' AND fecha <= ?';
      params.push(filtros.fecha_hasta);
    }

    query += ' ORDER BY fecha DESC LIMIT ?';
    params.push(filtros.limit || 100);

    const aportes = await db.all(query, params);

    // Procesar datos para el frontend
    return aportes.map(aporte => ({
      id: aporte.id,
      titulo: aporte.manhwa_titulo,
      tipo: aporte.contenido_tipo,
      proveedor: aporte.proveedor,
      archivo: {
        path: aporte.archivo_path,
        size: aporte.archivo_size,
        nombre: path.basename(aporte.archivo_path)
      },
      fecha: aporte.fecha,
      descripcion: aporte.contenido,
      metadata: aporte.mensaje_original ? JSON.parse(aporte.mensaje_original) : {}
    }));

  } catch (error) {
    console.error('Error obteniendo aportes de proveedores:', error);
    return [];
  }
}

/**
 * Limpiar títulos de manhwa duplicados o mal detectados
 */
async function cleanupManhwaTitles() {
  try {
    // Obtener títulos únicos
    const titles = await db.all(`
      SELECT DISTINCT manhwa_titulo, COUNT(*) as count
      FROM aportes 
      WHERE tipo = 'proveedor_auto' AND manhwa_titulo != 'Desconocido'
      GROUP BY manhwa_titulo
      ORDER BY count DESC
    `);

    console.log('📊 Títulos de manhwa detectados:');
    titles.forEach(title => {
      console.log(`  - ${title.manhwa_titulo}: ${title.count} aportes`);
    });

    return titles;
  } catch (error) {
    console.error('Error limpiando títulos:', error);
    return [];
  }
}

export {
  processProviderMessage,
  getProviderStats,
  getProviderAportes,
  cleanupManhwaTitles,
  detectManhwaTitle,
  detectContentType
};
