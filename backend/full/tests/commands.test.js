const { handleAportar, handlePedido, handleBan, handleUnban } = require('../commands.js');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let db;

beforeAll(async () => {
  db = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE aportes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contenido TEXT,
      tipo TEXT,
      usuario TEXT,
      grupo TEXT,
      fecha TEXT
    );
    CREATE TABLE pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      texto TEXT,
      estado TEXT,
      usuario TEXT,
      grupo TEXT,
      fecha TEXT
    );
    CREATE TABLE baneados (
      usuario TEXT PRIMARY KEY,
      motivo TEXT,
      fecha TEXT
    );
  `);

  // Override db in commands.js to use this in-memory db
  const commands = require('../commands.js');
  commands.db = db;
});

describe('Commands handlers', () => {
  test('handleAportar inserts aporte', async () => {
    const result = await handleAportar('Test aporte', 'manhwa', 'user1', 'group1', '2024-06-01T00:00:00Z');
    expect(result.success).toBe(true);
    const row = await db.get('SELECT * FROM aportes WHERE usuario = ?', 'user1');
    expect(row.contenido).toBe('Test aporte');
  });

  test('handlePedido inserts pedido', async () => {
    const result = await handlePedido('Quiero el cap 1', 'user2', 'group1', '2024-06-01T00:00:00Z');
    expect(result.success).toBe(true);
    const row = await db.get('SELECT * FROM pedidos WHERE usuario = ?', 'user2');
    expect(row.texto).toBe('Quiero el cap 1');
    expect(row.estado).toBe('pendiente');
  });

  test('handleBan inserts ban', async () => {
    const result = await handleBan('user3', 'Spam', '2024-06-01T00:00:00Z');
    expect(result.success).toBe(true);
    const row = await db.get('SELECT * FROM baneados WHERE usuario = ?', 'user3');
    expect(row.motivo).toBe('Spam');
  });

  test('handleUnban removes ban', async () => {
    await handleBan('user4', 'Test ban', '2024-06-01T00:00:00Z');
    const result = await handleUnban('user4');
    expect(result.success).toBe(true);
    const row = await db.get('SELECT * FROM baneados WHERE usuario = ?', 'user4');
    expect(row).toBeUndefined();
  });
});
