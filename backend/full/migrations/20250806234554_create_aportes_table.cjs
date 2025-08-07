/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('aportes', function(table) {
    table.increments('id').primary();
    table.string('titulo').notNullable();
    table.string('tipo');
    table.string('usuario');
    table.string('archivo');
    table.timestamp('fecha_aporte').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('aportes');
};
