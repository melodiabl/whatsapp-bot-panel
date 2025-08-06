import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fixMelodiaPermissions() {
  const db = await open({
    filename: join(__dirname, 'storage', 'database.sqlite'),
    driver: sqlite3.Database,
  });
  
  try {
    console.log('1. Eliminando usuario Melodia actual...');
    await db.run('DELETE FROM usuarios WHERE username = ?', ['Melodia']);
    
    console.log('2. Creando nuevo usuario Melodia con rol owner...');
    const hashedPassword = await bcrypt.hash('melodia@2010', 10);
    
    const stmt = await db.prepare(
      'INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)'
    );
    await stmt.run('Melodia', hashedPassword, 'owner');
    await stmt.finalize();
    
    console.log('3. Verificando nuevo usuario...');
    const newUser = await db.get('SELECT * FROM usuarios WHERE username = ?', ['Melodia']);
    console.log('Nuevo usuario Melodia:', {
      id: newUser.id,
      username: newUser.username,
      rol: newUser.rol
    });
    
    console.log('✅ Usuario Melodia recreado correctamente con permisos de owner');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.close();
  }
}

fixMelodiaPermissions();
