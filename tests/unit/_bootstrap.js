const { knex } = require("../../config");

/**
 * Run migrations.
 */
before(async function() {
  await knex.migrate.latest();
});
/**
 * Seed database for every test.
 */
beforeEach(async function() {
  await knex.seed.run({
    directory: "./seeds/test"
  });
});
/**
 * Clean up database connections.
 */
after(async function() {
  await knex.destroy();
});
