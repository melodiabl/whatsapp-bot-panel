const sqlite3 = require('sqlite3');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'storage', 'database.sqlite'));

// Actualizar el rol de Melodia a owner
db.run('UPDATE usuarios SET rol = ? WHERE username = ?', ['owner', 'Melodia'], function(err) {
  if (err) {
    console.error('Error actualizando rol de Melodia:', err);
  } else {
    console.log('✅ Rol de Melodia actualizado a OWNER');
    console.log('Filas afectadas:', this.changes);
  }
  
  // Verificar el cambio
  db.get('SELECT * FROM usuarios WHERE username = ?', ['Melodia'], (err, row) => {
    if (err) {
      console.error('Error verificando usuario:', err);
    } else if (row) {
      console.log('✅ Usuario verificado:', row);
    } else {
      console.log('❌ Usuario no encontrado');
    }
    db.close();
  });
});
