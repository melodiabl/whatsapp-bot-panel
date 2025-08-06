import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createOwner() {
  try {
    // Abrir conexión a la base de datos
    const db = await open({
      filename: join(__dirname, 'storage', 'database.sqlite'),
      driver: sqlite3.Database,
    });

    console.log('🔐 Creando usuario owner...');

    // Datos del owner
    const username = 'Melodia';
    const password = 'melodia@2010';
    const rol = 'owner';

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar si el usuario ya existe
    const existingUser = await db.get('SELECT * FROM usuarios WHERE username = ?', [username]);
    
    if (existingUser) {
      console.log('⚠️ El usuario ya existe. Actualizando...');
      
      // Actualizar usuario existente
      await db.run(
        'UPDATE usuarios SET password = ?, rol = ? WHERE username = ?',
        [hashedPassword, rol, username]
      );
      
      console.log('✅ Usuario owner actualizado exitosamente');
    } else {
      // Crear nuevo usuario
      await db.run(
        'INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)',
        [username, hashedPassword, rol]
      );
      
      console.log('✅ Usuario owner creado exitosamente');
    }

    // Mostrar información del usuario creado
    const user = await db.get('SELECT id, username, rol FROM usuarios WHERE username = ?', [username]);
    console.log('👤 Información del usuario:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Rol: ${user.rol}`);
    console.log(`   Password: ${password} (original)`);

    await db.close();
    console.log('🎉 Proceso completado exitosamente');

  } catch (error) {
    console.error('❌ Error creando usuario owner:', error);
    process.exit(1);
  }
}

// Ejecutar la función
createOwner();
