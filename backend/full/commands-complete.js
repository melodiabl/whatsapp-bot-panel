import { db } from './index.js';
import { getSocket } from './whatsapp.js';

// Variables globales para configuración del bot
let modoPrivado = false;
let modoAmigos = false;
let advertenciasActivas = true;

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
 * Verificar si un grupo está autorizado
 */
async function isGroupAuthorized(grupoId) {
  try {
    const grupo = await db.get('SELECT * FROM grupos_autorizados WHERE jid = ?', [grupoId]);
    return !!grupo;
  } catch (error) {
    return false;
  }
}

/**
 * Verificar si un grupo es proveedor
 */
async function isProviderGroup(grupoId) {
  try {
    const grupo = await db.get('SELECT * FROM grupos_autorizados WHERE jid = ? AND tipo = ?', [grupoId, 'proveedor']);
    return !!grupo;
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
 * /help - Muestra lista de comandos disponibles según rol
 */
async function handleHelp(usuario, grupo, isGroup) {
  const isAdmin = await isOwnerOrAdmin(usuario);
  
  let helpText = `*📋 Lista completa de comandos:*\n\n`;
  
  // Comandos disponibles para todos los usuarios
  helpText += `*🔹 Comandos generales:*\n`;
  helpText += `/help, /menu, !help, !menu - Mostrar esta ayuda\n`;
  helpText += `/ia [texto] - Consultar IA (Google Gemini/OpenAI)\n`;
  helpText += `/myaportes - Ver solo tus aportes\n`;
  helpText += `/addaporte [tipo] [contenido] - Enviar aporte al sistema\n`;
  helpText += `/pedido [contenido] - Hacer pedido y buscar en base de datos\n`;
  helpText += `/pedidos - Ver tus pedidos\n`;
  helpText += `/manhwas - Lista todos los manhwas disponibles\n`;
  helpText += `/series - Lista todas las series disponibles\n`;
  helpText += `/addserie [título|género|estado|descripción] - Agregar nueva serie\n`;
  helpText += `/ilustraciones - Ver ilustraciones guardadas\n`;
  helpText += `/extra [nombre] - Registrar extra de manhwa\n`;
  helpText += `/votar [opción] - Votar en votación activa\n\n`;
  
  // Comandos para grupos autorizados
  helpText += `*🔹 Comandos de grupos autorizados:*\n`;
  helpText += `/aportes - Ver todos los aportes del sistema\n\n`;
  
  // Comandos de administración (Owner/Admin)
  helpText += `*🔹 Comandos de administración:*\n`;
  helpText += `/addgroup [nombre] - Autorizar grupo actual\n`;
  helpText += `/delgroup - Eliminar grupo de autorizados\n`;
  helpText += `/addmanhwa [título|autor|género|estado|descripción|url|proveedor] - Agregar manhwa\n`;
  helpText += `/logs - Ver registros de actividad del bot\n`;
  helpText += `/privado - Activar/desactivar modo privado\n`;
  helpText += `/amigos - Activar/desactivar modo amigos\n`;
  helpText += `/advertencias on/off - Configurar sistema de advertencias\n\n`;
  
  // Comandos de votación
  helpText += `*🔹 Sistema de votaciones:*\n`;
  helpText += `/crearvotacion [pregunta | opción1 | opción2...] - Crear votación\n`;
  helpText += `/cerrarvotacion [ID] - Cerrar votación activa\n\n`;
  
  // Comandos de obtención desde grupos proveedor
  helpText += `*🔹 Obtención de contenido (grupos proveedor):*\n`;
  helpText += `/obtenermanhwa [nombre] - Descargar manhwa desde proveedor\n`;
  helpText += `/obtenerextra [nombre] - Descargar extra desde proveedor\n`;
  helpText += `/obtenerilustracion [nombre] - Guardar ilustración desde proveedor\n`;
  helpText += `/obtenerpack [nombre] - Descargar pack desde proveedor\n\n`;
  
  // Comandos de descarga y almacenamiento
  helpText += `*🔹 Sistema de descarga y almacenamiento:*\n`;
  helpText += `/descargar [url] [nombre] [categoria] - Descargar archivo desde URL\n`;
  helpText += `/guardar [categoria] - Guardar archivo multimedia del chat\n`;
  helpText += `/archivos [categoria] - Listar archivos descargados\n`;
  helpText += `/misarchivos - Ver tus archivos descargados\n`;
  helpText += `/buscararchivo [nombre] - Buscar archivos por nombre\n`;
  helpText += `/estadisticas - Ver estadísticas de descargas (Admin)\n`;
  helpText += `/limpiar - Limpiar archivos antiguos (Admin)\n\n`;
  
  // Comandos de moderación
  helpText += `*🔹 Moderación:*\n`;
  helpText += `/ban @usuario [motivo] - Banear usuario\n`;
  helpText += `/unban @usuario - Desbanear usuario\n\n`;
  
  // Información adicional
  helpText += `*ℹ️ Información:*\n`;
  helpText += `• Los comandos funcionan con / o !\n`;
  helpText += `• Algunos comandos requieren permisos específicos\n`;
  helpText += `• El bot guarda metadatos de todo el contenido\n`;
  helpText += `• Todo se muestra en tiempo real en el panel web\n\n`;
  
  if (!isAdmin) {
    helpText += `*⚠️ Nota:* Algunos comandos requieren permisos de Owner/Admin`;
  }
  
  await logCommand('consulta', 'help', usuario, grupo);
  return { success: true, message: helpText };
}

/**
 * /ia [texto] - Responde usando IA
 */
async function handleIA(prompt, usuario, grupo) {
  try {
    // Aquí se integraría con Google Gemini u OpenAI
    // Por ahora, respuesta simulada
    const response = `🤖 *Respuesta de IA:*\n\nEsta es una respuesta simulada para: "${prompt}"\n\n_Nota: Integración con IA pendiente de configurar._`;
    
    await logCommand('comando', 'ia', usuario, grupo);
    return { success: true, message: response };
  } catch (error) {
    return { success: false, message: 'Error al procesar consulta de IA.' };
  }
}

/**
 * /addgroup - Autoriza el grupo actual
 */
async function handleAddGroup(usuario, grupo, groupName) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden autorizar grupos.' };
  }
  
  try {
    const stmt = await db.prepare(
      'INSERT OR REPLACE INTO grupos_autorizados (jid, nombre, tipo, proveedor) VALUES (?, ?, ?, ?)'
    );
    await stmt.run(grupo, groupName || 'Grupo Autorizado', 'normal', 'General');
    await stmt.finalize();
    
    await logCommand('administracion', 'addgroup', usuario, grupo);
    return { success: true, message: '✅ Grupo autorizado correctamente.' };
  } catch (error) {
    return { success: false, message: 'Error al autorizar grupo.' };
  }
}

/**
 * /delgroup - Elimina un grupo de la lista de autorizados
 */
async function handleDelGroup(usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden eliminar grupos.' };
  }
  
  try {
    const stmt = await db.prepare('DELETE FROM grupos_autorizados WHERE jid = ?');
    await stmt.run(grupo);
    await stmt.finalize();
    
    await logCommand('administracion', 'delgroup', usuario, grupo);
    return { success: true, message: '✅ Grupo eliminado de la lista de autorizados.' };
  } catch (error) {
    return { success: false, message: 'Error al eliminar grupo.' };
  }
}

/**
 * /myaportes - Lista solo los aportes del usuario
 */
async function handleMyAportes(usuario, grupo) {
  try {
    const aportes = await db.all(
      'SELECT * FROM aportes WHERE usuario = ? ORDER BY fecha DESC LIMIT 10',
      [usuario]
    );
    
    if (aportes.length === 0) {
      return { success: true, message: '📝 No tienes aportes registrados.' };
    }
    
    let message = `📝 *Tus aportes (${aportes.length}):*\n\n`;
    aportes.forEach((aporte, index) => {
      const fecha = new Date(aporte.fecha).toLocaleDateString();
      message += `${index + 1}. *${aporte.tipo}*: ${aporte.contenido}\n`;
      message += `   📅 ${fecha}\n\n`;
    });
    
    await logCommand('consulta', 'myaportes', usuario, grupo);
    return { success: true, message };
  } catch (error) {
    return { success: false, message: 'Error al obtener tus aportes.' };
  }
}

/**
 * /aportes - Lista todos los aportes (solo grupos autorizados)
 */
async function handleAportes(usuario, grupo, isGroup) {
  if (isGroup && !await isGroupAuthorized(grupo)) {
    return { success: false, message: '❌ Este grupo no está autorizado.' };
  }
  
  try {
    const aportes = await db.all(
      'SELECT * FROM aportes ORDER BY fecha DESC LIMIT 20'
    );
    
    if (aportes.length === 0) {
      return { success: true, message: '📝 No hay aportes registrados.' };
    }
    
    let message = `📝 *Todos los aportes (${aportes.length}):*\n\n`;
    aportes.forEach((aporte, index) => {
      const fecha = new Date(aporte.fecha).toLocaleDateString();
      message += `${index + 1}. *${aporte.tipo}* por @${aporte.usuario}\n`;
      message += `   ${aporte.contenido}\n`;
      message += `   📅 ${fecha}\n\n`;
    });
    
    await logCommand('consulta', 'aportes', usuario, grupo);
    return { success: true, message };
  } catch (error) {
    return { success: false, message: 'Error al obtener aportes.' };
  }
}

/**
 * /manhwas - Lista todos los manhwas disponibles
 */
async function handleManhwas(usuario, grupo) {
  try {
    const manhwas = await db.all('SELECT * FROM manhwas ORDER BY titulo');
    
    if (manhwas.length === 0) {
      return { success: true, message: '📚 No hay manhwas registrados.' };
    }
    
    let message = `📚 *Manhwas disponibles (${manhwas.length}):*\n\n`;
    manhwas.forEach((manhwa, index) => {
      message += `${index + 1}. *${manhwa.titulo}*\n`;
      message += `   👤 Autor: ${manhwa.autor}\n`;
      message += `   📊 Estado: ${manhwa.estado}\n`;
      if (manhwa.descripcion) {
        message += `   📝 ${manhwa.descripcion.substring(0, 50)}...\n`;
      }
      message += `\n`;
    });
    
    await logCommand('consulta', 'manhwas', usuario, grupo);
    return { success: true, message };
  } catch (error) {
    return { success: false, message: 'Error al obtener manhwas.' };
  }
}

/**
 * /addaporte [datos] - Permite enviar un aporte
 */
async function handleAddAporte(contenido, tipo, usuario, grupo, fecha) {
  try {
    const stmt = await db.prepare(
      'INSERT INTO aportes (contenido, tipo, usuario, grupo, fecha) VALUES (?, ?, ?, ?, ?)'
    );
    await stmt.run(contenido, tipo, usuario, grupo, fecha);
    await stmt.finalize();
    
    await logCommand('comando', 'addaporte', usuario, grupo);
    return { success: true, message: `✅ Aporte de tipo "${tipo}" guardado correctamente.` };
  } catch (error) {
    return { success: false, message: 'Error al guardar aporte.' };
  }
}

/**
 * /addmanhwa [datos] - Permite agregar un nuevo manhwa (solo Owner/Admin)
 */
async function handleAddManhwa(datos, usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden agregar manhwas.' };
  }
  
  try {
    // Parsear datos: título|autor|género|estado|descripción|url|proveedor
    const parts = datos.split('|');
    if (parts.length < 4) {
      return { success: false, message: '❌ Formato: título|autor|género|estado|descripción|url|proveedor' };
    }
    
    const [titulo, autor, genero, estado, descripcion = '', url = '', proveedor = 'General'] = parts;
    const fecha_registro = new Date().toISOString();
    
    const stmt = await db.prepare(
      'INSERT INTO manhwas (titulo, autor, genero, estado, descripcion, url, proveedor, fecha_registro, usuario_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    await stmt.run(titulo, autor, genero, estado, descripcion, url, proveedor, fecha_registro, usuario);
    await stmt.finalize();
    
    await logCommand('administracion', 'addmanhwa', usuario, grupo);
    return { success: true, message: `✅ Manhwa "${titulo}" agregado correctamente.` };
  } catch (error) {
    return { success: false, message: 'Error al agregar manhwa.' };
  }
}

/**
 * /addserie [datos] - Permite agregar una nueva serie (cualquier usuario autorizado)
 */
async function handleAddSerie(datos, usuario, grupo, isGroup) {
  // Verificar si es grupo autorizado o usuario admin
  if (isGroup && !await isGroupAuthorized(grupo) && !await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Este grupo no está autorizado para agregar series.' };
  }
  
  try {
    // Parsear datos con formato más simple: título|género|estado|descripción
    const parts = datos.split('|');
    if (parts.length < 2) {
      return { success: false, message: '❌ Formato: título|género|estado|descripción\nEjemplo: /addserie Attack on Titan|Acción|Finalizada|Serie sobre titanes' };
    }
    
    const [titulo, genero = 'Serie', estado = 'En emisión', descripcion = ''] = parts;
    const fecha_registro = new Date().toISOString();
    
    // Verificar si la serie ya existe
    const serieExistente = await db.get(
      'SELECT * FROM manhwas WHERE titulo = ? AND genero LIKE ?',
      [titulo, '%serie%']
    );
    
    if (serieExistente) {
      return { success: false, message: `❌ La serie "${titulo}" ya existe en la base de datos.` };
    }
    
    const stmt = await db.prepare(
      'INSERT INTO manhwas (titulo, autor, genero, estado, descripcion, url, proveedor, fecha_registro, usuario_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    await stmt.run(titulo, 'Varios', `Serie - ${genero}`, estado, descripcion, '', 'Series', fecha_registro, usuario);
    await stmt.finalize();
    
    // También registrar como aporte
    const stmtAporte = await db.prepare(
      'INSERT INTO aportes (contenido, tipo, usuario, grupo, fecha) VALUES (?, ?, ?, ?, ?)'
    );
    await stmtAporte.run(`Serie agregada: ${titulo}`, 'serie', usuario, grupo, fecha_registro);
    await stmtAporte.finalize();
    
    await logCommand('comando', 'addserie', usuario, grupo);
    return { 
      success: true, 
      message: `✅ *Serie agregada correctamente:*\n\n📺 **${titulo}**\n🏷️ Género: ${genero}\n📊 Estado: ${estado}\n📝 ${descripcion}\n👤 Agregada por: @${usuario}` 
    };
  } catch (error) {
    return { success: false, message: 'Error al agregar serie.' };
  }
}

/**
 * /series - Lista todas las series disponibles
 */
async function handleSeries(usuario, grupo) {
  try {
    const series = await db.all(
      'SELECT * FROM manhwas WHERE genero LIKE ? ORDER BY titulo',
      ['%Serie%']
    );
    
    if (series.length === 0) {
      return { success: true, message: '📺 No hay series registradas.' };
    }
    
    let message = `📺 *Series disponibles (${series.length}):*\n\n`;
    series.forEach((serie, index) => {
      message += `${index + 1}. **${serie.titulo}**\n`;
      message += `   🏷️ ${serie.genero.replace('Serie - ', '')}\n`;
      message += `   📊 Estado: ${serie.estado}\n`;
      if (serie.descripcion) {
        message += `   📝 ${serie.descripcion.substring(0, 60)}...\n`;
      }
      message += `   👤 Por: @${serie.usuario_registro}\n\n`;
    });
    
    await logCommand('consulta', 'series', usuario, grupo);
    return { success: true, message };
  } catch (error) {
    return { success: false, message: 'Error al obtener series.' };
  }
}

/**
 * /pedido [contenido] - Hace un pedido y busca en la base de datos si existe
 */
async function handlePedido(contenido, usuario, grupo, fecha) {
  try {
    // Buscar en manhwas
    const manhwaEncontrado = await db.get(
      'SELECT * FROM manhwas WHERE titulo LIKE ? OR titulo LIKE ?',
      [`%${contenido}%`, `${contenido}%`]
    );
    
    // Buscar en aportes
    const aporteEncontrado = await db.get(
      'SELECT * FROM aportes WHERE contenido LIKE ? OR contenido LIKE ?',
      [`%${contenido}%`, `${contenido}%`]
    );
    
    // Registrar el pedido en la base de datos
    const stmt = await db.prepare(
      'INSERT INTO pedidos (texto, estado, usuario, grupo, fecha) VALUES (?, ?, ?, ?, ?)'
    );
    await stmt.run(contenido, 'pendiente', usuario, grupo, fecha);
    await stmt.finalize();
    
    let response = `📋 *Pedido registrado:* "${contenido}"\n\n`;
    
    // Si encontró contenido, mencionarlo
    if (manhwaEncontrado) {
      response += `✅ *¡Encontrado en manhwas!*\n`;
      response += `📚 **${manhwaEncontrado.titulo}**\n`;
      response += `👤 Autor: ${manhwaEncontrado.autor}\n`;
      response += `📊 Estado: ${manhwaEncontrado.estado}\n`;
      if (manhwaEncontrado.descripcion) {
        response += `📝 ${manhwaEncontrado.descripcion}\n`;
      }
      if (manhwaEncontrado.url) {
        response += `🔗 ${manhwaEncontrado.url}\n`;
      }
      response += `\n`;
    }
    
    if (aporteEncontrado) {
      response += `✅ *¡Encontrado en aportes!*\n`;
      response += `📁 **${aporteEncontrado.contenido}**\n`;
      response += `🏷️ Tipo: ${aporteEncontrado.tipo}\n`;
      response += `👤 Aportado por: @${aporteEncontrado.usuario}\n`;
      response += `📅 Fecha: ${new Date(aporteEncontrado.fecha).toLocaleDateString()}\n\n`;
    }
    
    if (!manhwaEncontrado && !aporteEncontrado) {
      response += `⏳ *No encontrado en la base de datos*\n`;
      response += `Tu pedido ha sido registrado y será revisado por los administradores.\n`;
    }
    
    await logCommand('comando', 'pedido', usuario, grupo);
    return { success: true, message: response };
  } catch (error) {
    return { success: false, message: 'Error al procesar pedido.' };
  }
}

/**
 * /pedidos - Muestra los pedidos del usuario
 */
async function handlePedidos(usuario, grupo) {
  try {
    const pedidos = await db.all(
      'SELECT * FROM pedidos WHERE usuario = ? ORDER BY fecha DESC LIMIT 10',
      [usuario]
    );
    
    if (pedidos.length === 0) {
      return { success: true, message: '📋 No tienes pedidos registrados.' };
    }
    
    let message = `📋 *Tus pedidos (${pedidos.length}):*\n\n`;
    pedidos.forEach((pedido, index) => {
      const fecha = new Date(pedido.fecha).toLocaleDateString();
      const estado = pedido.estado === 'pendiente' ? '⏳' : pedido.estado === 'completado' ? '✅' : '❌';
      message += `${index + 1}. ${estado} ${pedido.texto}\n`;
      message += `   📅 ${fecha} - Estado: ${pedido.estado}\n\n`;
    });
    
    await logCommand('consulta', 'pedidos', usuario, grupo);
    return { success: true, message };
  } catch (error) {
    return { success: false, message: 'Error al obtener pedidos.' };
  }
}

/**
 * /extra [nombre] - Detecta si es un extra de un manhwa y lo registra
 */
async function handleExtra(nombre, usuario, grupo, fecha) {
  try {
    // Buscar manhwa relacionado
    const manhwa = await db.get(
      'SELECT * FROM manhwas WHERE titulo LIKE ? OR titulo LIKE ?',
      [`%${nombre}%`, `${nombre}%`]
    );
    
    let contenido = `Extra: ${nombre}`;
    if (manhwa) {
      contenido = `Extra de "${manhwa.titulo}": ${nombre}`;
    }
    
    const stmt = await db.prepare(
      'INSERT INTO aportes (contenido, tipo, usuario, grupo, fecha) VALUES (?, ?, ?, ?, ?)'
    );
    await stmt.run(contenido, 'extra', usuario, grupo, fecha);
    await stmt.finalize();
    
    await logCommand('comando', 'extra', usuario, grupo);
    return { success: true, message: `✅ Extra "${nombre}" registrado correctamente.` };
  } catch (error) {
    return { success: false, message: 'Error al registrar extra.' };
  }
}

/**
 * /ilustraciones - Lista las ilustraciones guardadas
 */
async function handleIlustraciones(usuario, grupo) {
  try {
    const ilustraciones = await db.all(
      'SELECT * FROM ilustraciones ORDER BY fecha DESC LIMIT 15'
    );
    
    if (ilustraciones.length === 0) {
      return { success: true, message: '🎨 No hay ilustraciones registradas.' };
    }
    
    let message = `🎨 *Ilustraciones disponibles (${ilustraciones.length}):*\n\n`;
    ilustraciones.forEach((ilustracion, index) => {
      const fecha = new Date(ilustracion.fecha).toLocaleDateString();
      message += `${index + 1}. Por @${ilustracion.usuario}\n`;
      message += `   📅 ${fecha}\n\n`;
    });
    
    await logCommand('consulta', 'ilustraciones', usuario, grupo);
    return { success: true, message };
  } catch (error) {
    return { success: false, message: 'Error al obtener ilustraciones.' };
  }
}

/**
 * /logs - Muestra últimos registros de actividad (solo Owner/Admin)
 */
async function handleLogs(usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden ver logs.' };
  }
  
  try {
    const logs = await db.all(
      'SELECT * FROM logs ORDER BY fecha DESC LIMIT 20'
    );
    
    if (logs.length === 0) {
      return { success: true, message: '📊 No hay logs registrados.' };
    }
    
    let message = `📊 *Últimos logs (${logs.length}):*\n\n`;
    logs.forEach((log, index) => {
      const fecha = new Date(log.fecha).toLocaleString();
      message += `${index + 1}. *${log.comando}* (${log.tipo})\n`;
      message += `   👤 @${log.usuario}\n`;
      message += `   📅 ${fecha}\n\n`;
    });
    
    await logCommand('consulta', 'logs', usuario, grupo);
    return { success: true, message };
  } catch (error) {
    return { success: false, message: 'Error al obtener logs.' };
  }
}

/**
 * /privado - Activa/desactiva el modo privado del bot
 */
async function handlePrivado(usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden cambiar el modo privado.' };
  }
  
  modoPrivado = !modoPrivado;
  
  await logCommand('configuracion', 'privado', usuario, grupo);
  return { 
    success: true, 
    message: `🔒 Modo privado ${modoPrivado ? 'activado' : 'desactivado'}.` 
  };
}

/**
 * /amigos - Activa/desactiva el modo amigos
 */
async function handleAmigos(usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden cambiar el modo amigos.' };
  }
  
  modoAmigos = !modoAmigos;
  
  await logCommand('configuracion', 'amigos', usuario, grupo);
  return { 
    success: true, 
    message: `👥 Modo amigos ${modoAmigos ? 'activado' : 'desactivado'}.` 
  };
}

/**
 * /advertencias on/off - Activa o desactiva las advertencias
 */
async function handleAdvertencias(estado, usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden configurar advertencias.' };
  }
  
  if (estado === 'on') {
    advertenciasActivas = true;
  } else if (estado === 'off') {
    advertenciasActivas = false;
  } else {
    return { success: false, message: '❌ Uso: /advertencias on o /advertencias off' };
  }
  
  await logCommand('configuracion', 'advertencias', usuario, grupo);
  return { 
    success: true, 
    message: `⚠️ Advertencias ${advertenciasActivas ? 'activadas' : 'desactivadas'}.` 
  };
}

/**
 * /votar [opción] - Permite votar en una votación activa
 */
async function handleVotar(opcion, usuario, grupo) {
  try {
    // Buscar votación activa
    const votacion = await db.get(
      'SELECT * FROM votaciones WHERE estado = ? ORDER BY fecha_inicio DESC LIMIT 1',
      ['activa']
    );
    
    if (!votacion) {
      return { success: false, message: '❌ No hay votaciones activas.' };
    }
    
    // Verificar si ya votó
    const votoExistente = await db.get(
      'SELECT * FROM votos WHERE votacion_id = ? AND usuario = ?',
      [votacion.id, usuario]
    );
    
    if (votoExistente) {
      return { success: false, message: '❌ Ya has votado en esta votación.' };
    }
    
    // Registrar voto
    const fecha = new Date().toISOString();
    const stmt = await db.prepare(
      'INSERT INTO votos (votacion_id, usuario, opcion, fecha) VALUES (?, ?, ?, ?)'
    );
    await stmt.run(votacion.id, usuario, opcion, fecha);
    await stmt.finalize();
    
    await logCommand('comando', 'votar', usuario, grupo);
    return { success: true, message: `✅ Voto registrado: "${opcion}"` };
  } catch (error) {
    return { success: false, message: 'Error al registrar voto.' };
  }
}

/**
 * /crearvotacion [pregunta | opción1 | opción2...] - Crea una nueva votación
 */
async function handleCrearVotacion(datos, usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden crear votaciones.' };
  }
  
  try {
    const parts = datos.split('|').map(part => part.trim());
    if (parts.length < 3) {
      return { success: false, message: '❌ Formato: pregunta | opción1 | opción2 | ...\n\nEjemplo: /crearvotacion ¿Cuál es tu manhwa favorito? | Solo Leveling | Tower of God | The Beginning After The End' };
    }
    
    const [titulo, ...opciones] = parts;
    const fecha_inicio = new Date().toISOString();
    const fecha_fin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 días
    
    const stmt = await db.prepare(
      'INSERT INTO votaciones (titulo, descripcion, opciones, fecha_inicio, fecha_fin, estado, creador) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const result = await stmt.run(titulo, '', JSON.stringify(opciones), fecha_inicio, fecha_fin, 'activa', usuario);
    await stmt.finalize();
    
    const votacionId = result.lastID;
    
    // Crear mensaje de votación para el grupo
    let mensajeVotacion = `🗳️ *NUEVA VOTACIÓN INICIADA*\n\n`;
    mensajeVotacion += `📋 **${titulo}**\n\n`;
    mensajeVotacion += `📊 *Opciones disponibles:*\n`;
    
    opciones.forEach((opcion, index) => {
      mensajeVotacion += `${index + 1}. ${opcion}\n`;
    });
    
    mensajeVotacion += `\n⏰ *Duración:* 7 días\n`;
    mensajeVotacion += `👤 *Creada por:* @${usuario}\n`;
    mensajeVotacion += `🆔 *ID:* #${votacionId}\n\n`;
    mensajeVotacion += `💡 *Para votar usa:* /votar [opción]\n`;
    mensajeVotacion += `📝 *Ejemplo:* /votar ${opciones[0]}\n\n`;
    mensajeVotacion += `_¡Participa y haz que tu voz sea escuchada!_ 🎯`;
    
    await logCommand('administracion', 'crearvotacion', usuario, grupo);
    
    return { 
      success: true, 
      message: mensajeVotacion,
      votacionCreada: true,
      votacionId: votacionId
    };
  } catch (error) {
    console.error('Error al crear votación:', error);
    return { success: false, message: 'Error al crear votación.' };
  }
}

/**
 * /cerrarvotacion [ID] - Cierra una votación activa
 */
async function handleCerrarVotacion(id, usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden cerrar votaciones.' };
  }
  
  try {
    const stmt = await db.prepare(
      'UPDATE votaciones SET estado = ? WHERE id = ?'
    );
    await stmt.run('cerrada', id);
    await stmt.finalize();
    
    await logCommand('administracion', 'cerrarvotacion', usuario, grupo);
    return { success: true, message: `✅ Votación #${id} cerrada correctamente.` };
  } catch (error) {
    return { success: false, message: 'Error al cerrar votación.' };
  }
}

// Comandos de obtención desde grupos proveedor (solo Owner/Admin)

/**
 * /obtenermanhwa [nombre] - Descarga y guarda un manhwa desde grupo proveedor
 */
async function handleObtenerManhwa(nombre, usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden obtener contenido.' };
  }
  
  if (!await isProviderGroup(grupo)) {
    return { success: false, message: '❌ Este comando solo funciona en grupos proveedor.' };
  }
  
  try {
    // Simular obtención de manhwa
    const fecha = new Date().toISOString();
    const stmt = await db.prepare(
      'INSERT INTO aportes (contenido, tipo, usuario, grupo, fecha) VALUES (?, ?, ?, ?, ?)'
    );
    await stmt.run(`Manhwa obtenido: ${nombre}`, 'manhwa', usuario, grupo, fecha);
    await stmt.finalize();
    
    await logCommand('obtencion', 'obtenermanhwa', usuario, grupo);
    return { success: true, message: `✅ Manhwa "${nombre}" obtenido y guardado.` };
  } catch (error) {
    return { success: false, message: 'Error al obtener manhwa.' };
  }
}

/**
 * /obtenerextra [nombre] - Descarga y guarda el extra de un manhwa
 */
async function handleObtenerExtra(nombre, usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden obtener contenido.' };
  }
  
  if (!await isProviderGroup(grupo)) {
    return { success: false, message: '❌ Este comando solo funciona en grupos proveedor.' };
  }
  
  try {
    const fecha = new Date().toISOString();
    const stmt = await db.prepare(
      'INSERT INTO aportes (contenido, tipo, usuario, grupo, fecha) VALUES (?, ?, ?, ?, ?)'
    );
    await stmt.run(`Extra obtenido: ${nombre}`, 'extra', usuario, grupo, fecha);
    await stmt.finalize();
    
    await logCommand('obtencion', 'obtenerextra', usuario, grupo);
    return { success: true, message: `✅ Extra "${nombre}" obtenido y guardado.` };
  } catch (error) {
    return { success: false, message: 'Error al obtener extra.' };
  }
}

/**
 * /obtenerilustracion [nombre] - Guarda una ilustración desde grupo proveedor
 */
async function handleObtenerIlustracion(nombre, usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden obtener contenido.' };
  }
  
  if (!await isProviderGroup(grupo)) {
    return { success: false, message: '❌ Este comando solo funciona en grupos proveedor.' };
  }
  
  try {
    const fecha = new Date().toISOString();
    const stmt = await db.prepare(
      'INSERT INTO ilustraciones (imagen, usuario, grupo, fecha) VALUES (?, ?, ?, ?)'
    );
    await stmt.run(nombre, usuario, grupo, fecha);
    await stmt.finalize();
    
    await logCommand('obtencion', 'obtenerilustracion', usuario, grupo);
    return { success: true, message: `✅ Ilustración "${nombre}" obtenida y guardada.` };
  } catch (error) {
    return { success: false, message: 'Error al obtener ilustración.' };
  }
}

/**
 * /obtenerpack [nombre] - Guarda un pack de contenido desde grupo proveedor
 */
async function handleObtenerPack(nombre, usuario, grupo) {
  if (!await isOwnerOrAdmin(usuario)) {
    return { success: false, message: '❌ Solo Owner/Admin pueden obtener contenido.' };
  }
  
  if (!await isProviderGroup(grupo)) {
    return { success: false, message: '❌ Este comando solo funciona en grupos proveedor.' };
  }
  
  try {
    const fecha = new Date().toISOString();
    const stmt = await db.prepare(
      'INSERT INTO aportes (contenido, tipo, usuario, grupo, fecha) VALUES (?, ?, ?, ?, ?)'
    );
    await stmt.run(`Pack obtenido: ${nombre}`, 'pack', usuario, grupo, fecha);
    await stmt.finalize();
    
    await logCommand('obtencion', 'obtenerpack', usuario, grupo);
    return { success: true, message: `✅ Pack "${nombre}" obtenido y guardado.` };
  } catch (error) {
    return { success: false, message: 'Error al obtener pack.' };
  }
}

// Funciones de utilidad existentes
async function handleBan(usuario, motivo, fecha) {
  try {
    const stmt = await db.prepare(
      'INSERT OR REPLACE INTO baneados (usuario, motivo, fecha) VALUES (?, ?, ?)'
    );
    await stmt.run(usuario, motivo, fecha);
    await stmt.finalize();
    return { success: true, message: 'Usuario baneado correctamente.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function handleUnban(usuario) {
  try {
    const stmt = await db.prepare('DELETE FROM baneados WHERE usuario = ?');
    await stmt.run(usuario);
    await stmt.finalize();
    return { success: true, message: 'Usuario desbaneado correctamente.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export {
  // Comandos básicos
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
  
  // Comandos de administración
  handleAddGroup,
  handleDelGroup,
  handleAddManhwa,
  handleLogs,
  handlePrivado,
  handleAmigos,
  handleAdvertencias,
  
  // Comandos de votación
  handleVotar,
  handleCrearVotacion,
  handleCerrarVotacion,
  
  // Comandos de obtención
  handleObtenerManhwa,
  handleObtenerExtra,
  handleObtenerIlustracion,
  handleObtenerPack,
  
  // Comandos existentes
  handleBan,
  handleUnban,
  
  // Variables de estado
  modoPrivado,
  modoAmigos,
  advertenciasActivas
};
