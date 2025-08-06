import bcrypt from 'bcrypt';

async function verifyPassword() {
  const storedHash = '$2b$10$fRtvCR49Q8DPhFK/qHh8yeDghxXxnTbeLzO2tyAVziby3GbzDqyJq';
  const password = 'melodia@2010';
  
  const isValid = await bcrypt.compare(password, storedHash);
  console.log('Contraseña "melodia@2010" coincide con el hash:', isValid);
  
  if (isValid) {
    console.log('✅ El usuario Melodia ya tiene la contraseña correcta');
  } else {
    console.log('❌ La contraseña no coincide');
  }
}

verifyPassword().catch(console.error);
