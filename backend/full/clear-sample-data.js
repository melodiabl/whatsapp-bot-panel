import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function clearSampleData() {
  try {
    const db = await open({
      filename: join(__dirname, 'storage', 'database.sqlite'),
      driver: sqlite3.Database,
    });

    console.log('🧹 Limpiando datos de ejemplo...');

    // Limpiar todas las tablas de datos de ejemplo
    await db.run('DELETE FROM aportes');
    console.log('✅ Tabla aportes limpiada');

    await db.run('DELETE FROM pedidos');
    console.log('✅ Tabla pedidos limpiada');

    await db.run('DELETE FROM logs');
    console.log('✅ Tabla logs limpiada');

    await db.run('DELETE FROM votaciones');
    await db.run('DELETE FROM votos');
    console.log('✅ Tablas votaciones y votos limpiadas');

    await db.run('DELETE FROM manhwas');
    console.log('✅ Tabla manhwas limpiada');

    await db.run('DELETE FROM grupos_autorizados');
    console.log('✅ Tabla grupos_autorizados limpiada');

    await db.run('DELETE FROM advertencias');
    console.log('✅ Tabla advertencias limpiada');

    await db.run('DELETE FROM usuarios_actividad');
    console.log('✅ Tabla usuarios_actividad limpiada');

    await db.run('DELETE FROM baneados');
    console.log('✅ Tabla baneados limpiada');

    await db.run('DELETE FROM ilustraciones');
    console.log('✅ Tabla ilustraciones limpiada');

    await db.run('DELETE FROM configuracion');
    console.log('✅ Tabla configuracion limpiada');

    // Limpiar usuarios excepto admin
    await db.run('DELETE FROM usuarios WHERE username != ?', ['admin']);
    console.log('✅ Usuarios limpiados (manteniendo admin)');

    // Verificar si existe usuario admin, si no, crearlo
    const adminUser = await db.get('SELECT * FROM usuarios WHERE username = ?', ['admin']);
    
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      const stmt = await db.prepare(
        'INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)'
      );
      await stmt.run('admin', hashedPassword, 'admin');
      await stmt.finalize();
      console.log('✅ Usuario admin creado');
    } else {
      console.log('✅ Usuario admin ya existe');
    }

    // Resetear los contadores de autoincremento
    await db.run('DELETE FROM sqlite_sequence WHERE name IN ("aportes", "pedidos", "logs", "votaciones", "votos", "manhwas", "advertencias", "ilustraciones")');
    console.log('✅ Contadores de autoincremento reseteados');

    await db.close();
    console.log('🎉 Base de datos limpiada exitosamente');
    console.log('');
    console.log('📋 Estado actual:');
    console.log('   - Todas las tablas de datos están vacías');
    console.log('   - Usuario admin disponible (usuario: admin, contraseña: admin)');
    console.log('   - Sistema listo para uso en producción');

  } catch (error) {
    console.error('❌ Error limpiando la base de datos:', error);
  }
}

clearSampleData();
