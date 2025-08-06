import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateGruposProveedor() {
  console.log('🔄 Migrando tabla grupos_autorizados para agregar campo proveedor...');
  
  const db = await open({
    filename: join(__dirname, 'storage', 'database.sqlite'),
    driver: sqlite3.Database,
  });

  try {
    // Verificar si la columna proveedor ya existe en grupos_autorizados
    const tableInfo = await db.all("PRAGMA table_info(grupos_autorizados)");
    const hasProveedorColumn = tableInfo.some(column => column.name === 'proveedor');
    
    if (!hasProveedorColumn) {
      console.log('📝 Agregando columna proveedor a la tabla grupos_autorizados...');
      await db.exec('ALTER TABLE grupos_autorizados ADD COLUMN proveedor TEXT');
      console.log('✅ Columna proveedor agregada correctamente');
      
      // Actualizar registros existentes con un proveedor por defecto
      await db.exec("UPDATE grupos_autorizados SET proveedor = 'General' WHERE proveedor IS NULL");
      console.log('✅ Registros existentes actualizados con proveedor por defecto');
    } else {
      console.log('ℹ️ La columna proveedor ya existe en grupos_autorizados');
    }
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await db.close();
    console.log('✅ Migración de grupos completada');
  }
}

migrateGruposProveedor().catch(console.error);
