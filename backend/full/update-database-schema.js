import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function updateDatabaseSchema() {
  try {
    const db = await open({
      filename: join(__dirname, 'storage', 'database.sqlite'),
      driver: sqlite3.Database,
    });

    console.log('🔄 Actualizando esquema de base de datos...');

    // Agregar columna 'proveedor' a manhwas si no existe
    try {
      await db.exec(`ALTER TABLE manhwas ADD COLUMN proveedor TEXT DEFAULT 'General'`);
      console.log('✅ Columna proveedor agregada a manhwas');
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        console.log('ℹ️ Columna proveedor ya existe en manhwas');
      }
    }

    // Agregar columna 'tipo' a grupos_autorizados si no existe
    try {
      await db.exec(`ALTER TABLE grupos_autorizados ADD COLUMN tipo TEXT DEFAULT 'normal'`);
      console.log('✅ Columna tipo agregada a grupos_autorizados');
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        console.log('ℹ️ Columna tipo ya existe en grupos_autorizados');
      }
    }

    // Agregar columna 'proveedor' a grupos_autorizados si no existe
    try {
      await db.exec(`ALTER TABLE grupos_autorizados ADD COLUMN proveedor TEXT DEFAULT 'General'`);
      console.log('✅ Columna proveedor agregada a grupos_autorizados');
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        console.log('ℹ️ Columna proveedor ya existe en grupos_autorizados');
      }
    }

    // Crear tabla de configuración del bot si no existe
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bot_config (
        clave TEXT PRIMARY KEY,
        valor TEXT,
        descripcion TEXT,
        fecha_modificacion TEXT
      )
    `);
    console.log('✅ Tabla bot_config verificada/creada');

    // Insertar configuraciones por defecto
    const configs = [
      ['modo_privado', 'false', 'Modo privado del bot activado/desactivado'],
      ['modo_amigos', 'false', 'Modo amigos del bot activado/desactivado'],
      ['advertencias_activas', 'true', 'Sistema de advertencias activado/desactivado'],
      ['ia_provider', 'gemini', 'Proveedor de IA (gemini/openai)'],
      ['ia_api_key', '', 'Clave API para el proveedor de IA']
    ];

    for (const [clave, valor, descripcion] of configs) {
      try {
        const fecha = new Date().toISOString();
        await db.run(
          'INSERT OR IGNORE INTO bot_config (clave, valor, descripcion, fecha_modificacion) VALUES (?, ?, ?, ?)',
          [clave, valor, descripcion, fecha]
        );
      } catch (error) {
        console.log(`ℹ️ Configuración ${clave} ya existe`);
      }
    }
    console.log('✅ Configuraciones por defecto insertadas');

    // Crear índices para mejorar rendimiento
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_aportes_usuario ON aportes(usuario);
      CREATE INDEX IF NOT EXISTS idx_aportes_fecha ON aportes(fecha);
      CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario);
      CREATE INDEX IF NOT EXISTS idx_logs_fecha ON logs(fecha);
      CREATE INDEX IF NOT EXISTS idx_votaciones_estado ON votaciones(estado);
      CREATE INDEX IF NOT EXISTS idx_votos_votacion ON votos(votacion_id);
      CREATE INDEX IF NOT EXISTS idx_manhwas_titulo ON manhwas(titulo);
      CREATE INDEX IF NOT EXISTS idx_grupos_jid ON grupos_autorizados(jid);
    `);
    console.log('✅ Índices de rendimiento creados');

    await db.close();
    console.log('🎉 Esquema de base de datos actualizado exitosamente');

  } catch (error) {
    console.error('❌ Error actualizando esquema de base de datos:', error);
  }
}

updateDatabaseSchema();
