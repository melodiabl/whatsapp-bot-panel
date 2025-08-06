import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkAllMelodiaUsers() {
  const db = await open({
    filename: join(__dirname, 'storage', 'database.sqlite'),
    driver: sqlite3.Database,
  });
  
  const users = await db.all('SELECT * FROM usuarios WHERE username = ?', ['Melodia']);
  console.log('Usuarios con nombre "Melodia":');
  console.log('Total encontrados:', users.length);
  
  users.forEach((user, index) => {
    console.log(`\nUsuario ${index + 1}:`);
    console.log('ID:', user.id);
    console.log('Username:', user.username);
    console.log('Rol:', user.rol);
    console.log('Password hash:', user.password);
  });
  
  await db.close();
}

checkAllMelodiaUsers().catch(console.error);
