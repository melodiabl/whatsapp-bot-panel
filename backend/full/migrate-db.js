import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateDatabase() {
  console.log('🔄 Migrando base de datos...');
  
  const db = await open({
    filename: join(__dirname, 'storage', 'database.sqlite'),
    driver: sqlite3.Database,
  });

  try {
    // Verificar si la columna proveedor ya existe
    const tableInfo = await db.all("PRAGMA table_info(manhwas)");
    const hasProveedorColumn = tableInfo.some(column => column.name === 'proveedor');
    
    if (!hasProveedorColumn) {
      console.log('📝 Agregando columna proveedor a la tabla manhwas...');
      await db.exec('ALTER TABLE manhwas ADD COLUMN proveedor TEXT');
      console.log('✅ Columna proveedor agregada correctamente');
      
      // Actualizar registros existentes con un proveedor por defecto
      await db.exec("UPDATE manhwas SET proveedor = 'Grupo BL General' WHERE proveedor IS NULL");
      console.log('✅ Registros existentes actualizados con proveedor por defecto');
    } else {
      console.log('ℹ️ La columna proveedor ya existe');
    }
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await db.close();
    console.log('✅ Migración completada');
  }
}

migrateDatabase().catch(console.error);
