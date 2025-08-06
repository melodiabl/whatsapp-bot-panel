import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateDatabaseForDownloads() {
  const dbPath = path.join(__dirname, 'storage', 'database.sqlite');
  
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('🔄 Actualizando base de datos para sistema de descargas...');

    // Tabla para registrar descargas
    await db.exec(`
      CREATE TABLE IF NOT EXISTS descargas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        category TEXT NOT NULL,
        usuario TEXT NOT NULL,
        size INTEGER DEFAULT 0,
        source TEXT DEFAULT 'manual',
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        estado TEXT DEFAULT 'completada',
        metadata TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Índices para optimizar consultas
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_descargas_usuario ON descargas(usuario);
      CREATE INDEX IF NOT EXISTS idx_descargas_category ON descargas(category);
      CREATE INDEX IF NOT EXISTS idx_descargas_fecha ON descargas(fecha);
      CREATE INDEX IF NOT EXISTS idx_descargas_filename ON descargas(filename);
    `);

    // Tabla para metadatos de archivos multimedia
    await db.exec(`
      CREATE TABLE IF NOT EXISTS archivos_multimedia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descarga_id INTEGER,
        tipo_media TEXT NOT NULL,
        mimetype TEXT,
        duracion INTEGER DEFAULT 0,
        resolucion TEXT,
        thumbnail_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (descarga_id) REFERENCES descargas(id) ON DELETE CASCADE
      )
    `);

    // Tabla para configuración del sistema de archivos
    await db.exec(`
      CREATE TABLE IF NOT EXISTS configuracion_archivos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clave TEXT UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        descripcion TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar configuraciones por defecto
    await db.exec(`
      INSERT OR IGNORE INTO configuracion_archivos (clave, valor, descripcion) VALUES
      ('max_file_size', '104857600', 'Tamaño máximo de archivo en bytes (100MB)'),
      ('auto_cleanup_days', '30', 'Días después de los cuales se eliminan archivos automáticamente'),
      ('allowed_extensions', 'jpg,jpeg,png,gif,webp,mp4,avi,mov,pdf,zip,rar,txt,doc,docx', 'Extensiones de archivo permitidas'),
      ('storage_limit_gb', '5', 'Límite de almacenamiento total en GB'),
      ('enable_thumbnails', 'true', 'Generar miniaturas para imágenes y videos')
    `);

    // Actualizar tabla de logs para incluir más tipos
    await db.exec(`
      CREATE TABLE IF NOT EXISTS logs_extended (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL,
        comando TEXT NOT NULL,
        usuario TEXT NOT NULL,
        grupo TEXT,
        detalles TEXT DEFAULT '{}',
        ip_address TEXT,
        user_agent TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        procesado BOOLEAN DEFAULT FALSE
      )
    `);

    // Tabla para estadísticas de uso
    await db.exec(`
      CREATE TABLE IF NOT EXISTS estadisticas_uso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha DATE NOT NULL,
        comando TEXT NOT NULL,
        usuario TEXT NOT NULL,
        grupo TEXT,
        contador INTEGER DEFAULT 1,
        tiempo_respuesta INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fecha, comando, usuario, grupo)
      )
    `);

    // Tabla para notificaciones del sistema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS notificaciones_sistema (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL,
        titulo TEXT NOT NULL,
        mensaje TEXT NOT NULL,
        usuario_destino TEXT,
        grupo_destino TEXT,
        leida BOOLEAN DEFAULT FALSE,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_leida DATETIME
      )
    `);

    // Verificar si las tablas se crearon correctamente
    const tables = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('descargas', 'archivos_multimedia', 'configuracion_archivos')
    `);

    console.log('✅ Tablas creadas/verificadas:', tables.map(t => t.name).join(', '));

    // Verificar estructura de la tabla descargas
    const downloadTableInfo = await db.all('PRAGMA table_info(descargas)');
    console.log('📋 Estructura tabla descargas:');
    downloadTableInfo.forEach(col => {
      console.log(`   - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });

    await db.close();
    console.log('✅ Base de datos actualizada correctamente para sistema de descargas');

  } catch (error) {
    console.error('❌ Error actualizando base de datos:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  updateDatabaseForDownloads()
    .then(() => {
      console.log('🎉 Actualización completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la actualización:', error);
      process.exit(1);
    });
}

export { updateDatabaseForDownloads };
