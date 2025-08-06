import { db } from './index.js';
import { 
  downloadFile, 
  processWhatsAppMedia, 
  listDownloads, 
  getDownloadStats,
  cleanOldFiles,
  checkDiskSpace 
} from './file-manager.js';

/**
 * Verificar si un usuario es Owner/Admin
 */
async function isOwnerOrAdmin(usuario) {
  try {
    const user = await db.get('SELECT rol FROM usuarios WHERE username = ?', [usuario]);
    return user && (user.rol === 'admin' || user.rol === 'owner');
  } catch (error) {
    return false;
  }
}

/**
 * Registrar log de comando
 */
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

/**
 * /descargar [url] [nombre] [categoria] - Descarga archivo desde URL
 */
async function handleDescargar(url, nombre, categoria, usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden descargar archivos.' };
  }

  try {
    // Validar parámetros
    if (!url || !nombre || !categoria) {
      return { 
        success: false, 
        message: '❌ Uso: /descargar [url] [nombre] [categoria]\nCategorías: manhwa, serie, extra, ilustracion, pack' 
      };
    }

    // Validar categoría
    const validCategories = ['manhwa', 'serie', 'extra', 'ilustracion', 'pack'];
    if (!validCategories.includes(categoria.toLowerCase())) {
      return { 
        success: false, 
        message: `❌ Categoría inválida. Usa: ${validCategories.join(', ')}` 
      };
    }

    // Verificar espacio disponible
    const spaceCheck = checkDiskSpace();
    if (!spaceCheck.available) {
      return { success: false, message: '❌ Espacio insuficiente en disco.' };
    }

    // Iniciar descarga
    const result = await downloadFile(url, nombre, categoria.toLowerCase(), usuario);

    if (result.success) {
      const sizeText = formatFileSize(result.size);
      const statusText = result.exists ? '(ya existía)' : '(nuevo)';
      
      await logCommand('descarga', 'descargar', usuario, grupo);
      
      return { 
        success: true, 
        message: `✅ *Descarga completada* ${statusText}\n\n📁 **${nombre}**\n🏷️ Categoría: ${categoria}\n📊 Tamaño: ${sizeText}\n👤 Por: @${usuario}` 
      };
    } else {
      return { success: false, message: '❌ Error en la descarga.' };
    }

  } catch (error) {
    console.error('Error en descarga:', error);
    return { success: false, message: `❌ Error: ${error.message}` };
  }
}

/**
 * /guardar [categoria] - Guarda archivo multimedia enviado en el chat
 */
async function handleGuardar(categoria, usuario, grupo, message) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden guardar archivos.' };
  }

  try {
    // Validar categoría
    const validCategories = ['manhwa', 'serie', 'extra', 'ilustracion', 'pack'];
    if (!categoria || !validCategories.includes(categoria.toLowerCase())) {
      return { 
        success: false, 
        message: `❌ Uso: /guardar [categoria]\nCategorías: ${validCategories.join(', ')}\n\n*Envía este comando como respuesta a una imagen, video o documento.*` 
      };
    }

    // Verificar que hay media en el mensaje
    if (!message || !message.message) {
      return { success: false, message: '❌ No se detectó archivo multimedia. Responde a una imagen, video o documento.' };
    }

    const hasMedia = message.message.imageMessage || 
                    message.message.videoMessage || 
                    message.message.documentMessage || 
                    message.message.audioMessage;

    if (!hasMedia) {
      return { success: false, message: '❌ No se detectó archivo multimedia. Responde a una imagen, video o documento.' };
    }

    // Procesar media
    const result = await processWhatsAppMedia(message, categoria.toLowerCase(), usuario);

    if (result.success) {
      const sizeText = formatFileSize(result.size);
      
      await logCommand('almacenamiento', 'guardar', usuario, grupo);
      
      return { 
        success: true, 
        message: `✅ *Archivo guardado correctamente*\n\n📁 **${result.filename}**\n🏷️ Categoría: ${categoria}\n📊 Tamaño: ${sizeText}\n🎯 Tipo: ${result.mediaType}\n👤 Por: @${usuario}` 
      };
    } else {
      return { success: false, message: '❌ Error al guardar archivo.' };
    }

  } catch (error) {
    console.error('Error guardando archivo:', error);
    return { success: false, message: `❌ Error: ${error.message}` };
  }
}

/**
 * /archivos [categoria] - Lista archivos descargados
 */
async function handleArchivos(categoria, usuario, grupo) {
  try {
    // Validar categoría si se proporciona
    if (categoria) {
      const validCategories = ['manhwa', 'serie', 'extra', 'ilustracion', 'pack'];
      if (!validCategories.includes(categoria.toLowerCase())) {
        return { 
          success: false, 
          message: `❌ Categoría inválida. Usa: ${validCategories.join(', ')} o deja vacío para ver todos.` 
        };
      }
    }

    const downloads = await listDownloads(categoria?.toLowerCase(), null);

    if (downloads.length === 0) {
      const categoryText = categoria ? ` de categoría "${categoria}"` : '';
      return { success: true, message: `📁 No hay archivos descargados${categoryText}.` };
    }

    let message = `📁 *Archivos descargados`;
    if (categoria) {
      message += ` - ${categoria.toUpperCase()}`;
    }
    message += `* (${downloads.length}):\n\n`;

    downloads.slice(0, 20).forEach((download, index) => {
      const fecha = new Date(download.fecha).toLocaleDateString();
      const sizeText = formatFileSize(download.size);
      message += `${index + 1}. **${download.filename}**\n`;
      message += `   🏷️ ${download.category}\n`;
      message += `   📊 ${sizeText}\n`;
      message += `   👤 @${download.usuario}\n`;
      message += `   📅 ${fecha}\n\n`;
    });

    if (downloads.length > 20) {
      message += `_... y ${downloads.length - 20} archivos más_\n\n`;
    }

    message += `💡 *Tip:* Usa /archivos [categoria] para filtrar por tipo.`;

    await logCommand('consulta', 'archivos', usuario, grupo);
    return { success: true, message };

  } catch (error) {
    console.error('Error listando archivos:', error);
    return { success: false, message: '❌ Error al obtener lista de archivos.' };
  }
}

/**
 * /misarchivos - Lista archivos del usuario actual
 */
async function handleMisArchivos(usuario, grupo) {
  try {
    const downloads = await listDownloads(null, usuario);

    if (downloads.length === 0) {
      return { success: true, message: '📁 No tienes archivos descargados.' };
    }

    let message = `📁 *Tus archivos descargados* (${downloads.length}):\n\n`;

    downloads.slice(0, 15).forEach((download, index) => {
      const fecha = new Date(download.fecha).toLocaleDateString();
      const sizeText = formatFileSize(download.size);
      message += `${index + 1}. **${download.filename}**\n`;
      message += `   🏷️ ${download.category}\n`;
      message += `   📊 ${sizeText}\n`;
      message += `   📅 ${fecha}\n\n`;
    });

    if (downloads.length > 15) {
      message += `_... y ${downloads.length - 15} archivos más_`;
    }

    await logCommand('consulta', 'misarchivos', usuario, grupo);
    return { success: true, message };

  } catch (error) {
    console.error('Error listando archivos del usuario:', error);
    return { success: false, message: '❌ Error al obtener tus archivos.' };
  }
}

/**
 * /estadisticas - Muestra estadísticas de descargas (solo Owner/Admin)
 */
async function handleEstadisticas(usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden ver estadísticas.' };
  }

  try {
    const stats = await getDownloadStats();

    let message = `📊 *Estadísticas de Descargas*\n\n`;
    message += `📁 **Total de archivos:** ${stats.totalFiles}\n`;
    message += `💾 **Espacio total:** ${formatFileSize(stats.totalSize)}\n\n`;

    if (stats.byCategory.length > 0) {
      message += `📋 **Por categoría:**\n`;
      stats.byCategory.forEach(cat => {
        const avgSize = formatFileSize(cat.avg_size);
        const totalSize = formatFileSize(cat.total_size);
        message += `• **${cat.category}**: ${cat.total} archivos (${totalSize})\n`;
      });
    }

    message += `\n💡 *Tip:* Usa /limpiar para eliminar archivos antiguos.`;

    await logCommand('consulta', 'estadisticas', usuario, grupo);
    return { success: true, message };

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { success: false, message: '❌ Error al obtener estadísticas.' };
  }
}

/**
 * /limpiar - Limpia archivos antiguos (solo Owner/Admin)
 */
async function handleLimpiar(usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden limpiar archivos.' };
  }

  try {
    const result = await cleanOldFiles();

    const freedSpaceText = formatFileSize(result.freedSpace);
    
    let message = `🧹 *Limpieza completada*\n\n`;
    message += `🗑️ **Archivos eliminados:** ${result.deletedCount}\n`;
    message += `💾 **Espacio liberado:** ${freedSpaceText}\n\n`;
    
    if (result.deletedCount === 0) {
      message += `✨ No había archivos antiguos para eliminar.`;
    } else {
      message += `✅ Se eliminaron archivos con más de 30 días de antigüedad.`;
    }

    await logCommand('administracion', 'limpiar', usuario, grupo);
    return { success: true, message };

  } catch (error) {
    console.error('Error limpiando archivos:', error);
    return { success: false, message: '❌ Error al limpiar archivos.' };
  }
}

/**
 * /buscararchivo [nombre] - Busca archivos por nombre
 */
async function handleBuscarArchivo(nombre, usuario, grupo) {
  try {
    if (!nombre) {
      return { success: false, message: '❌ Uso: /buscararchivo [nombre]' };
    }

    const downloads = await db.all(
      'SELECT * FROM descargas WHERE filename LIKE ? ORDER BY fecha DESC LIMIT 20',
      [`%${nombre}%`]
    );

    if (downloads.length === 0) {
      return { success: true, message: `🔍 No se encontraron archivos con "${nombre}".` };
    }

    let message = `🔍 *Archivos encontrados* (${downloads.length}):\n\n`;

    downloads.forEach((download, index) => {
      const fecha = new Date(download.fecha).toLocaleDateString();
      const sizeText = formatFileSize(download.size);
      message += `${index + 1}. **${download.filename}**\n`;
      message += `   🏷️ ${download.category}\n`;
      message += `   📊 ${sizeText}\n`;
      message += `   👤 @${download.usuario}\n`;
      message += `   📅 ${fecha}\n\n`;
    });

    await logCommand('consulta', 'buscararchivo', usuario, grupo);
    return { success: true, message };

  } catch (error) {
    console.error('Error buscando archivo:', error);
    return { success: false, message: '❌ Error al buscar archivos.' };
  }
}

/**
 * Formatear tamaño de archivo
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export {
  handleDescargar,
  handleGuardar,
  handleArchivos,
  handleMisArchivos,
  handleEstadisticas,
  handleLimpiar,
  handleBuscarArchivo
};
