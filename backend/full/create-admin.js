import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createAdmin() {
  try {
    const db = await open({
      filename: join(__dirname, 'storage', 'database.sqlite'),
      driver: sqlite3.Database,
    });

    // Verificar si ya existe un usuario admin
    const existingAdmin = await db.get('SELECT * FROM usuarios WHERE username = ?', ['admin']);
    
    if (existingAdmin) {
      console.log('✅ Usuario admin ya existe');
      await db.close();
      return;
    }

    // Crear usuario admin
    const hashedPassword = await bcrypt.hash('admin', 10);
    
    const stmt = await db.prepare(
      'INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)'
    );
    await stmt.run('admin', hashedPassword, 'admin');
    await stmt.finalize();

    console.log('✅ Usuario admin creado exitosamente');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin');
    console.log('   Rol: admin');

    await db.close();
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error);
  }
}

createAdmin();
