import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  console.log('🔄 Inicializando base de datos...');
  
  const db = await open({
    filename: join(__dirname, 'storage', 'database.sqlite'),
    driver: sqlite3.Database,
  });

  // Crear tablas si no existen
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      rol TEXT
    );
    CREATE TABLE IF NOT EXISTS aportes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contenido TEXT,
      tipo TEXT,
      usuario TEXT,
      grupo TEXT,
      fecha TEXT,
      pdf_generado TEXT
    );
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      texto TEXT,
      estado TEXT,
      usuario TEXT,
      grupo TEXT,
      fecha TEXT
    );
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT,
      comando TEXT,
      usuario TEXT,
      grupo TEXT,
      fecha TEXT
    );
    CREATE TABLE IF NOT EXISTS grupos_autorizados (
      jid TEXT PRIMARY KEY,
      nombre TEXT,
      tipo TEXT,
      proveedor TEXT DEFAULT 'General',
      min_messages INTEGER DEFAULT 100,
      max_warnings INTEGER DEFAULT 3,
      enable_warnings BOOLEAN DEFAULT 1,
      enable_restriction BOOLEAN DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS configuracion (
      clave TEXT PRIMARY KEY,
      valor TEXT
    );
    CREATE TABLE IF NOT EXISTS advertencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT,
      grupo TEXT,
      motivo TEXT,
      fecha TEXT,
      numero INTEGER
    );
    CREATE TABLE IF NOT EXISTS usuarios_actividad (
      usuario TEXT,
      grupo TEXT,
      mensajes INTEGER DEFAULT 0,
      fecha_ultimo_mensaje TEXT,
      PRIMARY KEY (usuario, grupo)
    );
    CREATE TABLE IF NOT EXISTS baneados (
      usuario TEXT PRIMARY KEY,
      motivo TEXT,
      fecha TEXT
    );
    CREATE TABLE IF NOT EXISTS ilustraciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      imagen TEXT,
      usuario TEXT,
      grupo TEXT,
      fecha TEXT
    );
    CREATE TABLE IF NOT EXISTS votaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT,
      descripcion TEXT,
      opciones TEXT,
      fecha_inicio TEXT,
      fecha_fin TEXT,
      estado TEXT,
      creador TEXT
    );
    CREATE TABLE IF NOT EXISTS votos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      votacion_id INTEGER,
      usuario TEXT,
      opcion TEXT,
      fecha TEXT,
      FOREIGN KEY (votacion_id) REFERENCES votaciones (id)
    );
    CREATE TABLE IF NOT EXISTS manhwas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT,
      autor TEXT,
      genero TEXT,
      estado TEXT,
      descripcion TEXT,
      url TEXT,
      proveedor TEXT,
      fecha_registro TEXT,
      usuario_registro TEXT
    );
  `);

  // Verificar si ya existen usuarios
  const existingUsers = await db.get('SELECT COUNT(*) as count FROM usuarios');
  
  if (existingUsers.count === 0) {
    console.log('👤 Creando usuarios por defecto...');
    
    // Crear usuarios por defecto
    const adminPassword = await bcrypt.hash('admin123', 10);
    const moderadorPassword = await bcrypt.hash('mod123', 10);
    const usuarioPassword = await bcrypt.hash('user123', 10);
    
    await db.run(
      'INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)',
      ['admin', adminPassword, 'admin']
    );
    
    await db.run(
      'INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)',
      ['moderador', moderadorPassword, 'moderador']
    );
    
    await db.run(
      'INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)',
      ['usuario', usuarioPassword, 'usuario']
    );
    
    console.log('✅ Usuarios creados:');
    console.log('   - admin / admin123 (rol: admin)');
    console.log('   - moderador / mod123 (rol: moderador)');
    console.log('   - usuario / user123 (rol: usuario)');
  }

  // Insertar configuración por defecto
  await db.run(
    'INSERT OR IGNORE INTO configuracion (clave, valor) VALUES (?, ?)',
    ['modo_privado', 'false']
  );
  
  await db.run(
    'INSERT OR IGNORE INTO configuracion (clave, valor) VALUES (?, ?)',
    ['modo_amigos', 'false']
  );
  
  await db.run(
    'INSERT OR IGNORE INTO configuracion (clave, valor) VALUES (?, ?)',
    ['advertencias_habilitadas', 'true']
  );

  // Insertar algunos datos de ejemplo para testing
  const existingVotaciones = await db.get('SELECT COUNT(*) as count FROM votaciones');
  if (existingVotaciones.count === 0) {
    console.log('🗳️ Creando votación de ejemplo...');
    await db.run(
      'INSERT INTO votaciones (titulo, descripcion, opciones, fecha_inicio, fecha_fin, estado, creador) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        'Mejor Manhwa del Mes',
        'Vota por tu manhwa favorito de este mes',
        JSON.stringify(['Solo Leveling', 'Tower of God', 'The Beginning After The End']),
        new Date().toISOString(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
        'activa',
        'admin'
      ]
    );
  }

  const existingManhwas = await db.get('SELECT COUNT(*) as count FROM manhwas');
  if (existingManhwas.count === 0) {
    console.log('📚 Creando manhwas de ejemplo...');
    const manhwas = [
      {
        titulo: 'Solo Leveling',
        autor: 'Chugong',
        genero: 'Acción, Fantasía',
        estado: 'Completado',
        descripcion: 'La historia de Sung Jin-Woo, el cazador más débil que se convierte en el más fuerte.',
        url: 'https://example.com/solo-leveling'
      },
      {
        titulo: 'Tower of God',
        autor: 'SIU',
        genero: 'Aventura, Fantasía',
        estado: 'En curso',
        descripcion: 'Bam sube la torre para encontrar a Rachel.',
        url: 'https://example.com/tower-of-god'
      },
      {
        titulo: 'The Beginning After The End',
        autor: 'TurtleMe',
        genero: 'Fantasía, Aventura',
        estado: 'En curso',
        descripcion: 'Un rey reencarna en un mundo de magia y bestias.',
        url: 'https://example.com/tbate'
      }
    ];

    for (const manhwa of manhwas) {
      await db.run(
        'INSERT INTO manhwas (titulo, autor, genero, estado, descripcion, url, proveedor, fecha_registro, usuario_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [manhwa.titulo, manhwa.autor, manhwa.genero, manhwa.estado, manhwa.descripcion, manhwa.url, manhwa.proveedor || 'Grupo BL General', new Date().toISOString(), 'admin']
      );
    }
  }

  await db.close();
  console.log('✅ Base de datos inicializada correctamente');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase().catch(console.error);
}

export { initializeDatabase };
