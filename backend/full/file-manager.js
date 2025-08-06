import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { db } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio base para almacenar archivos descargados
const DOWNLOADS_DIR = path.join(__dirname, 'storage', 'downloads');
const MEDIA_DIR = path.join(__dirname, 'storage', 'media');

// Crear directorios si no existen
function ensureDirectoriesExist() {
  const dirs = [
    DOWNLOADS_DIR,
    MEDIA_DIR,
    path.join(DOWNLOADS_DIR, 'manhwas'),
    path.join(DOWNLOADS_DIR, 'series'),
    path.join(DOWNLOADS_DIR, 'extras'),
    path.join(DOWNLOADS_DIR, 'ilustraciones'),
    path.join(DOWNLOADS_DIR, 'packs'),
    path.join(MEDIA_DIR, 'images'),
    path.join(MEDIA_DIR, 'videos'),
    path.join(MEDIA_DIR, 'documents'),
    path.join(MEDIA_DIR, 'audio')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Directorio creado: ${dir}`);
    }
  });
}

// Inicializar directorios
ensureDirectoriesExist();

/**
 * Descargar archivo desde URL
 * @param {string} url - URL del archivo a descargar
 * @param {string} filename - Nombre del archivo
 * @param {string} category - Categoría (manhwa, serie, extra, etc.)
 * @param {string} usuario - Usuario que solicita la descarga
 * @returns {Promise<Object>} Resultado de la descarga
 */
async function downloadFile(url, filename, category, usuario) {
  return new Promise((resolve, reject) => {
    try {
      // Validar URL
      if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        reject(new Error('URL inválida'));
        return;
      }

      // Determinar directorio de destino
      const categoryDir = path.join(DOWNLOADS_DIR, category + 's');
      const filepath = path.join(categoryDir, filename);

      // Verificar si el archivo ya existe
      if (fs.existsSync(filepath)) {
        resolve({
          success: true,
          message: 'Archivo ya existe',
          filepath: filepath,
          size: fs.statSync(filepath).size,
          exists: true
        });
        return;
      }

      const protocol = url.startsWith('https://') ? https : http;
      
      const request = protocol.get(url, (response) => {
        // Verificar código de respuesta
        if (response.statusCode !== 200) {
          reject(new Error(`Error HTTP: ${response.statusCode}`));
          return;
        }

        // Crear stream de escritura
        const fileStream = fs.createWriteStream(filepath);
        let downloadedBytes = 0;
        const totalBytes = parseInt(response.headers['content-length'] || '0');

        response.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          fileStream.write(chunk);
        });

        response.on('end', async () => {
          fileStream.end();
          
          // Registrar descarga en base de datos
          await registerDownload(filename, filepath, category, usuario, downloadedBytes, url);
          
          resolve({
            success: true,
            message: 'Descarga completada',
            filepath: filepath,
            size: downloadedBytes,
            totalSize: totalBytes,
            exists: false
          });
        });

        response.on('error', (error) => {
          fileStream.destroy();
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
          reject(error);
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      // Timeout de 30 segundos
      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Timeout de descarga'));
      });

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Procesar archivo multimedia de WhatsApp
 * @param {Object} message - Mensaje de WhatsApp con media
 * @param {string} category - Categoría del archivo
 * @param {string} usuario - Usuario que envía el archivo
 * @returns {Promise<Object>} Resultado del procesamiento
 */
async function processWhatsAppMedia(message, category, usuario) {
  try {
    const { getSocket } = await import('./whatsapp.js');
    const sock = getSocket();
    
    if (!sock) {
      throw new Error('Bot no conectado');
    }

    let mediaType = null;
    let mediaMessage = null;

    // Detectar tipo de media
    if (message.message.imageMessage) {
      mediaType = 'image';
      mediaMessage = message.message.imageMessage;
    } else if (message.message.videoMessage) {
      mediaType = 'video';
      mediaMessage = message.message.videoMessage;
    } else if (message.message.documentMessage) {
      mediaType = 'document';
      mediaMessage = message.message.documentMessage;
    } else if (message.message.audioMessage) {
      mediaType = 'audio';
      mediaMessage = message.message.audioMessage;
    } else {
      throw new Error('Tipo de media no soportado');
    }

    // Descargar media
    const buffer = await sock.downloadMediaMessage(message);
    
    // Generar nombre de archivo
    const timestamp = Date.now();
    const extension = getFileExtension(mediaMessage.mimetype || 'application/octet-stream');
    const filename = `${category}_${timestamp}_${usuario}.${extension}`;
    
    // Determinar directorio
    const mediaDir = path.join(MEDIA_DIR, mediaType + 's');
    const filepath = path.join(mediaDir, filename);

    // Guardar archivo
    fs.writeFileSync(filepath, buffer);

    // Registrar en base de datos
    await registerDownload(filename, filepath, category, usuario, buffer.length, 'whatsapp_media');

    return {
      success: true,
      message: 'Media procesada correctamente',
      filepath: filepath,
      size: buffer.length,
      mediaType: mediaType,
      filename: filename
    };

  } catch (error) {
    throw error;
  }
}

/**
 * Registrar descarga en base de datos
 */
async function registerDownload(filename, filepath, category, usuario, size, source) {
  try {
    const fecha = new Date().toISOString();
    const stmt = await db.prepare(`
      INSERT INTO descargas (
        filename, filepath, category, usuario, size, source, fecha, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.run(filename, filepath, category, usuario, size, source, fecha, 'completada');
    await stmt.finalize();
  } catch (error) {
    console.error('Error registrando descarga:', error);
  }
}

/**
 * Obtener extensión de archivo desde mimetype
 */
function getFileExtension(mimetype) {
  const mimeMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/avi': 'avi',
    'video/mov': 'mov',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'application/rar': 'rar',
    'text/plain': 'txt'
  };
  
  return mimeMap[mimetype] || 'bin';
}

/**
 * Listar archivos descargados por categoría
 */
async function listDownloads(category = null, usuario = null) {
  try {
    let query = 'SELECT * FROM descargas WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (usuario) {
      query += ' AND usuario = ?';
      params.push(usuario);
    }

    query += ' ORDER BY fecha DESC LIMIT 50';

    const downloads = await db.all(query, params);
    return downloads;
  } catch (error) {
    console.error('Error listando descargas:', error);
    return [];
  }
}

/**
 * Obtener estadísticas de descargas
 */
async function getDownloadStats() {
  try {
    const stats = await db.all(`
      SELECT 
        category,
        COUNT(*) as total,
        SUM(size) as total_size,
        AVG(size) as avg_size
      FROM descargas 
      GROUP BY category
    `);

    const totalFiles = await db.get('SELECT COUNT(*) as total FROM descargas');
    const totalSize = await db.get('SELECT SUM(size) as total FROM descargas');

    return {
      byCategory: stats,
      totalFiles: totalFiles.total,
      totalSize: totalSize.total || 0
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { byCategory: [], totalFiles: 0, totalSize: 0 };
  }
}

/**
 * Limpiar archivos antiguos (más de 30 días)
 */
async function cleanOldFiles() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const oldFiles = await db.all(
      'SELECT * FROM descargas WHERE fecha < ?',
      [thirtyDaysAgo]
    );

    let deletedCount = 0;
    let freedSpace = 0;

    for (const file of oldFiles) {
      try {
        if (fs.existsSync(file.filepath)) {
          const stats = fs.statSync(file.filepath);
          fs.unlinkSync(file.filepath);
          freedSpace += stats.size;
        }
        
        await db.run('DELETE FROM descargas WHERE id = ?', [file.id]);
        deletedCount++;
      } catch (error) {
        console.error(`Error eliminando archivo ${file.filename}:`, error);
      }
    }

    return {
      deletedCount,
      freedSpace
    };
  } catch (error) {
    console.error('Error limpiando archivos antiguos:', error);
    return { deletedCount: 0, freedSpace: 0 };
  }
}

/**
 * Verificar espacio disponible
 */
function checkDiskSpace() {
  try {
    const stats = fs.statSync(DOWNLOADS_DIR);
    // Implementación básica - en producción usar librerías como 'check-disk-space'
    return {
      available: true,
      message: 'Espacio disponible'
    };
  } catch (error) {
    return {
      available: false,
      message: 'Error verificando espacio'
    };
  }
}

export {
  downloadFile,
  processWhatsAppMedia,
  listDownloads,
  getDownloadStats,
  cleanOldFiles,
  checkDiskSpace,
  DOWNLOADS_DIR,
  MEDIA_DIR
};
