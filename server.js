const chalk = require("chalk").default;

/**
 * ------------------------------------------------------
 * Config.
 * ------------------------------------------------------
 */
const config = require("./config");

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
