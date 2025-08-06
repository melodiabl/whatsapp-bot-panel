import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkUser() {
  const db = await open({
    filename: join(__dirname, 'storage', 'database.sqlite'),
    driver: sqlite3.Database,
  });
  
  const user = await db.get('SELECT * FROM usuarios WHERE username = ?', ['Melodia']);
  console.log('Usuario Melodia:', user);
  
  await db.close();
}

checkUser().catch(console.error);
