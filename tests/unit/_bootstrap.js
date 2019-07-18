const { knex } = require("../../config");
const { deleteIndices, createIndices, putMappings } = require("../../gulpfile");

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
  // Run tasks individually instead of setupIndices()
  // Gulp series not executing synchronously
  const cp = () => {};
  await deleteIndices(cp);
  await createIndices(cp);
  await putMappings(cp);
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
