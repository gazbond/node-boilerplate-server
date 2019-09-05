const { knex } = require("../../config");
const {
  delete_indices,
  create_indices,
  put_mappings
} = require("../../gulpfile");

/**
 * Run migrations, re-create indexes and seed once.
 */
before(async function() {
  await knex.migrate.latest();
});
/**
 * Seed database and indices for every test.
 */
beforeEach(async function() {
  // Run tasks individually instead of setup_indices()
  // Gulp series not executing synchronously
  const cb = () => {};
  await delete_indices(cb);
  await create_indices(cb);
  await put_mappings(cb);
  // Run seeds.
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
