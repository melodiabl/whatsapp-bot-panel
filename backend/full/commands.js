import { db } from './index.js';

/**
 * Handle the /aportar command to save a new aporte in the database.
 * @param {string} contenido - The content description or title.
 * @param {string} tipo - The type of content (e.g., 'manhwa', 'ilustracion', 'extra').
 * @param {string} usuario - The user who sent the aporte.
 * @param {string} grupo - The group where the aporte was sent.
 * @param {string} fecha - The date/time of the aporte.
 */
async function handleAportar(contenido, tipo, usuario, grupo, fecha) {
  try {
    const stmt = await db.prepare(
      'INSERT INTO aportes (contenido, tipo, usuario, grupo, fecha) VALUES (?, ?, ?, ?, ?)'
    );
    await stmt.run(contenido, tipo, usuario, grupo, fecha);
    await stmt.finalize();
    return { success: true, message: `Aporte guardado correctamente para el usuario ${usuario}.` };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Handle the /pedido command to save a new pedido in the database.
 * @param {string} texto - The pedido text.
 * @param {string} usuario - The user who sent the pedido.
 * @param {string} grupo - The group where the pedido was sent.
 * @param {string} fecha - The date/time of the pedido.
 */
async function handlePedido(texto, usuario, grupo, fecha) {
  try {
    const stmt = await db.prepare(
      'INSERT INTO pedidos (texto, estado, usuario, grupo, fecha) VALUES (?, ?, ?, ?, ?)'
    );
    await stmt.run(texto, 'pendiente', usuario, grupo, fecha);
    await stmt.finalize();
    return { success: true, message: `Pedido guardado correctamente para el usuario ${usuario}.` };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Handle banning a user.
 * @param {string} usuario - The user to ban.
 * @param {string} motivo - Reason for ban.
 * @param {string} fecha - Date/time of ban.
 */
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

/**
 * Handle unbanning a user.
 * @param {string} usuario - The user to unban.
 */
async function handleUnban(usuario) {
  try {
    const stmt = await db.prepare(
      'DELETE FROM baneados WHERE usuario = ?'
    );
    await stmt.run(usuario);
    await stmt.finalize();
    return { success: true, message: 'Usuario desbaneado correctamente.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export {
  handleAportar,
  handlePedido,
  handleBan,
  handleUnban,
};
