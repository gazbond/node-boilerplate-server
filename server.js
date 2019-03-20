const chalk = require("chalk").default;
const { Model } = require("objection");

/**
 * ------------------------------------------------------
 * Config.
 * ------------------------------------------------------
 */
const environment = process.env.ENVIRONMENT || "development";
let configPath = "./config/dev.conf";
if (environment == "testing") {
  configPath = "./config/test.conf";
}
const config = require(configPath);

/**
 * ------------------------------------------------------
 * Knex database with Objection models (db).
 * ------------------------------------------------------
 */
const db = require("./knexfile")[environment];
const knex = require("knex")(db);
// Log SQL.
knex.on("query", query => {
  console.log(chalk.green(query.sql));
});
// Provide connection to models.
Model.knex(knex);

/**
 * ------------------------------------------------------
 * Create server.
 * ------------------------------------------------------
 */
const app = require("./app");
const port = process.env.PORT || 8080;
const name = config.name;
app.listen(port, () =>
  console.log(chalk.yellow(`${name} listening on ${port}`))
);
