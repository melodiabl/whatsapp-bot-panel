import jwt from 'jsonwebtoken';
import axios from 'axios';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

async function debugServerAuth() {
  try {
    // Generar token para Melodia
    const token = jwt.sign({ username: 'Melodia', rol: 'owner' }, JWT_SECRET, { expiresIn: '24h' });
    console.log('Token generado:', token);
    
    // Probar endpoint /auth/me para ver qué usuario obtiene el servidor
    console.log('\n--- Probando endpoint /auth/me ---');
    const meResponse = await axios.get('http://localhost:3001/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Usuario obtenido por el servidor:', meResponse.data);
    
  } catch (error) {
    console.error('Error en /auth/me:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }
}

debugServerAuth();
