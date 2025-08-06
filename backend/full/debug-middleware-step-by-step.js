import jwt from 'jsonwebtoken';
import axios from 'axios';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

async function debugMiddlewareStepByStep() {
  try {
    // Generar token para Melodia con rol owner
    const token = jwt.sign({ username: 'Melodia', rol: 'owner' }, JWT_SECRET, { expiresIn: '24h' });
    console.log('1. Token generado:', token);
    
    // Decodificar token para verificar contenido
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('2. Token decodificado:', decoded);
    
    // Probar endpoint que sabemos que funciona (GET /manhwas)
    console.log('\n--- Test 1: GET /manhwas (sin autorización especial) ---');
    try {
      const getManhwasResponse = await axios.get('http://localhost:3001/api/manhwas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ GET /manhwas exitoso');
    } catch (error) {
      console.log('❌ GET /manhwas falló:', error.response?.data);
    }
    
    // Probar endpoint que requiere autorización pero no es DELETE
    console.log('\n--- Test 2: POST /manhwas (requiere admin/owner/colaborador) ---');
    try {
      const postManhwaResponse = await axios.post('http://localhost:3001/api/manhwas', {
        titulo: 'Test Manhwa',
        autor: 'Test Author',
        genero: 'Test',
        estado: 'En curso',
        descripcion: 'Test description',
        url: 'http://test.com',
        proveedor: 'Test'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ POST /manhwas exitoso');
    } catch (error) {
      console.log('❌ POST /manhwas falló:', error.response?.data);
    }
    
    // Probar DELETE manhwa
    console.log('\n--- Test 3: DELETE /manhwas/4 (requiere admin/owner) ---');
    try {
      const deleteResponse = await axios.delete('http://localhost:3001/api/manhwas/4', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ DELETE /manhwas/4 exitoso:', deleteResponse.data);
    } catch (error) {
      console.log('❌ DELETE /manhwas/4 falló:', error.response?.data);
    }
    
  } catch (error) {
    console.error('Error general:', error.message);
  }
}

debugMiddlewareStepByStep();
