import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Inicializando proyecto para Railway...');

// Crear directorios necesarios
const directories = [
  'backend/full/storage',
  'backend/full/logs',
  'backend/lite/storage',
  'backend/lite/logs'
];

directories.forEach(dir => {
  const fullPath = join(__dirname, '..', dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Directorio creado: ${dir}`);
  }
});

// Construir frontend
console.log('🔨 Construyendo frontend...');
try {
  execSync('cd frontend-panel && npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend construido exitosamente');
} catch (error) {
  console.error('❌ Error construyendo frontend:', error.message);
  process.exit(1);
}

// Verificar que el build existe
const distPath = join(__dirname, '..', 'frontend-panel', 'dist');
if (!existsSync(distPath)) {
  console.error('❌ El directorio dist del frontend no existe');
  process.exit(1);
}

console.log('✅ Inicialización completada para Railway');
