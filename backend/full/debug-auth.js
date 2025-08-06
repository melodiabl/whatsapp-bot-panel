import jwt from 'jsonwebtoken';
import { getDb } from './index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

async function debugAuth() {
  try {
    // Generar token para Melodia
    const token = jwt.sign({ username: 'Melodia', rol: 'owner' }, JWT_SECRET, { expiresIn: '24h' });
    console.log('1. Token generado:', token);
    
    // Decodificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('2. Token decodificado:', decoded);
    
    // Buscar usuario en base de datos
    const db = getDb();
    if (!db) {
      console.log('3. ERROR: Base de datos no inicializada');
      return;
    }
    
    const user = await db.get('SELECT id, username, rol FROM usuarios WHERE username = ?', [decoded.username]);
    console.log('3. Usuario encontrado en BD:', user);
    
    // Verificar si el rol está en la lista de roles autorizados
    const authorizedRoles = ['admin', 'owner'];
    const hasPermission = authorizedRoles.includes(user?.rol);
    console.log('4. Roles autorizados:', authorizedRoles);
    console.log('5. Rol del usuario:', user?.rol);
    console.log('6. Tiene permisos:', hasPermission);
    
  } catch (error) {
    console.error('Error en debug:', error);
  }
}

// Esperar a que la base de datos esté inicializada
setTimeout(() => {
  debugAuth();
}, 2000);
