const { knex } = require("../../config");
const { deleteIndices, createIndices, putMappings } = require("../../gulpfile");

/**
 * Run migrations and seed database and indices once.
 */
before(async function() {
  await knex.migrate.latest();
  // Run tasks individually instead of setupIndices()
  // TODO: gulp series not executing synchronously
  const cp = () => {};
  await deleteIndices(cp);
  await createIndices(cp);
  await putMappings(cp);
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

/**
 * Ignore unhandled promises messages.
 * To handle promises inside forEach correctly see:
 * https://stackoverflow.com/questions/54412290/finding-unhandled-promise-rejections-inside-of-request-native-promisenode-js
 */
// process.on("unhandledRejection", () => {});
