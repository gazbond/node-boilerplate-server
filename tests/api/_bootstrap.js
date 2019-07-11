const { knex } = require("../../config");

/**
 * Run migrations and seed database once.
 */
before(async function() {
  await knex.migrate.latest();
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
