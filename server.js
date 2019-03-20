const chalk = require("chalk").default;

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
 * Knex database logging
 * ------------------------------------------------------
 */
config.knex.on("query", query => {
  console.log(chalk.green(query.sql));
});

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
