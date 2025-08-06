import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function addSampleData() {
  try {
    // Abrir conexión a la base de datos
    const db = await open({
      filename: join(__dirname, 'storage', 'database.sqlite'),
      driver: sqlite3.Database,
    });

    console.log('📊 Agregando datos de ejemplo...');

    // Agregar manhwas de ejemplo
    const manhwas = [
      {
        titulo: 'Attack on Titan',
        autor: 'Hajime Isayama',
        genero: 'Acción, Drama',
        estado: 'Finalizado',
        descripcion: 'La humanidad lucha contra titanes gigantes',
        url: 'https://example.com/aot',
        fecha_registro: new Date().toISOString(),
        usuario_registro: 'Melodia'
      },
      {
        titulo: 'One Piece',
        autor: 'Eiichiro Oda',
        genero: 'Aventura, Comedia',
        estado: 'En emisión',
        descripcion: 'Las aventuras de Monkey D. Luffy en busca del One Piece',
        url: 'https://example.com/onepiece',
        fecha_registro: new Date().toISOString(),
        usuario_registro: 'Melodia'
      },
      {
        titulo: 'Demon Slayer',
        autor: 'Koyoharu Gotouge',
        genero: 'Serie - Acción',
        estado: 'Finalizado',
        descripcion: 'Tanjiro lucha contra demonios para salvar a su hermana',
        url: 'https://example.com/demonslayer',
        fecha_registro: new Date().toISOString(),
        usuario_registro: 'Melodia'
      },
      {
        titulo: 'Jujutsu Kaisen',
        autor: 'Gege Akutami',
        genero: 'Serie - Sobrenatural',
        estado: 'En emisión',
        descripcion: 'Estudiantes luchan contra maldiciones sobrenaturales',
        url: 'https://example.com/jjk',
        fecha_registro: new Date().toISOString(),
        usuario_registro: 'Melodia'
      }
    ];

    for (const manhwa of manhwas) {
      await db.run(
        'INSERT INTO manhwas (titulo, autor, genero, estado, descripcion, url, fecha_registro, usuario_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [manhwa.titulo, manhwa.autor, manhwa.genero, manhwa.estado, manhwa.descripcion, manhwa.url, manhwa.fecha_registro, manhwa.usuario_registro]
      );
    }

    // Agregar aportes de ejemplo
    const aportes = [
      {
        contenido: 'Nuevo capítulo de Attack on Titan disponible',
        tipo: 'manga',
        usuario: '1234567890',
        grupo: '120363123456789@g.us',
        fecha: new Date().toISOString(),
        pdf_generado: null
      },
      {
        contenido: 'Ilustración de Mikasa Ackerman',
        tipo: 'ilustracion',
        usuario: '0987654321',
        grupo: '120363123456789@g.us',
        fecha: new Date().toISOString(),
        pdf_generado: null
      },
      {
        contenido: 'Pack de wallpapers de One Piece',
        tipo: 'pack',
        usuario: '1122334455',
        grupo: '120363123456789@g.us',
        fecha: new Date().toISOString(),
        pdf_generado: null
      }
    ];

    for (const aporte of aportes) {
      await db.run(
        'INSERT INTO aportes (contenido, tipo, usuario, grupo, fecha, pdf_generado) VALUES (?, ?, ?, ?, ?, ?)',
        [aporte.contenido, aporte.tipo, aporte.usuario, aporte.grupo, aporte.fecha, aporte.pdf_generado]
      );
    }

    // Agregar pedidos de ejemplo
    const pedidos = [
      {
        texto: 'Busco el manga completo de Naruto',
        estado: 'pendiente',
        usuario: '1234567890',
        grupo: '120363123456789@g.us',
        fecha: new Date().toISOString()
      },
      {
        texto: 'Necesito ilustraciones de Dragon Ball',
        estado: 'completado',
        usuario: '0987654321',
        grupo: '120363123456789@g.us',
        fecha: new Date().toISOString()
      }
    ];

    for (const pedido of pedidos) {
      await db.run(
        'INSERT INTO pedidos (texto, estado, usuario, grupo, fecha) VALUES (?, ?, ?, ?, ?)',
        [pedido.texto, pedido.estado, pedido.usuario, pedido.grupo, pedido.fecha]
      );
    }

    // Agregar votaciones de ejemplo
    const votaciones = [
      {
        titulo: '¿Cuál es tu anime favorito?',
        descripcion: 'Vota por tu anime favorito de la temporada',
        opciones: JSON.stringify(['Attack on Titan', 'Demon Slayer', 'Jujutsu Kaisen', 'One Piece']),
        fecha_inicio: new Date().toISOString(),
        fecha_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días después
        estado: 'activa',
        creador: 'Melodia'
      },
      {
        titulo: '¿Qué tipo de contenido prefieres?',
        descripcion: 'Ayúdanos a saber qué contenido te gusta más',
        opciones: JSON.stringify(['Manga', 'Ilustraciones', 'Packs', 'Videos']),
        fecha_inicio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días atrás
        fecha_fin: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 días después
        estado: 'activa',
        creador: 'Melodia'
      }
    ];

    for (const votacion of votaciones) {
      await db.run(
        'INSERT INTO votaciones (titulo, descripcion, opciones, fecha_inicio, fecha_fin, estado, creador) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [votacion.titulo, votacion.descripcion, votacion.opciones, votacion.fecha_inicio, votacion.fecha_fin, votacion.estado, votacion.creador]
      );
    }

    // Agregar algunos votos de ejemplo
    const votos = [
      { votacion_id: 1, usuario: '1234567890', opcion: 'Attack on Titan', fecha: new Date().toISOString() },
      { votacion_id: 1, usuario: '0987654321', opcion: 'Demon Slayer', fecha: new Date().toISOString() },
      { votacion_id: 1, usuario: '1122334455', opcion: 'Attack on Titan', fecha: new Date().toISOString() },
      { votacion_id: 2, usuario: '1234567890', opcion: 'Manga', fecha: new Date().toISOString() },
      { votacion_id: 2, usuario: '0987654321', opcion: 'Ilustraciones', fecha: new Date().toISOString() }
    ];

    for (const voto of votos) {
      await db.run(
        'INSERT INTO votos (votacion_id, usuario, opcion, fecha) VALUES (?, ?, ?, ?)',
        [voto.votacion_id, voto.usuario, voto.opcion, voto.fecha]
      );
    }

    // Agregar logs de ejemplo
    const logs = [
      {
        tipo: 'comando',
        comando: '/manhwas',
        usuario: '1234567890',
        grupo: '120363123456789@g.us',
        fecha: new Date().toISOString()
      },
      {
        tipo: 'comando',
        comando: '/series',
        usuario: '0987654321',
        grupo: '120363123456789@g.us',
        fecha: new Date().toISOString()
      },
      {
        tipo: 'sistema',
        comando: 'conexion_exitosa',
        usuario: 'bot',
        grupo: null,
        fecha: new Date().toISOString()
      }
    ];

    for (const log of logs) {
      await db.run(
        'INSERT INTO logs (tipo, comando, usuario, grupo, fecha) VALUES (?, ?, ?, ?, ?)',
        [log.tipo, log.comando, log.usuario, log.grupo, log.fecha]
      );
    }

    await db.close();
    console.log('✅ Datos de ejemplo agregados exitosamente');
    console.log('📊 Resumen de datos agregados:');
    console.log('   - 4 manhwas/series');
    console.log('   - 3 aportes');
    console.log('   - 2 pedidos');
    console.log('   - 2 votaciones');
    console.log('   - 5 votos');
    console.log('   - 3 logs');

  } catch (error) {
    console.error('❌ Error agregando datos de ejemplo:', error);
    process.exit(1);
  }
}

// Ejecutar la función
addSampleData();
