const path = require("path");
const express = require("express");
const expressStatusMonitor = require("express-status-monitor");
const expressLayouts = require("express-ejs-layouts");
const flash = require("express-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
const logger = require("morgan");
const chalk = require("chalk").default;
const sqlFormatter = require("sql-formatter");
const favicon = require("serve-favicon");
const { Model, ValidationError } = require("objection");

/**
 * ------------------------------------------------------
 * Config.
 * ------------------------------------------------------
 */
const config = require("./app.conf");

/**
 * ------------------------------------------------------
 * Knex database with Objection models (db).
 * ------------------------------------------------------
 */
const environment = process.env.ENVIRONMENT || "development";
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
 * Public router.
 * ------------------------------------------------------
 */
const routerPublic = express.Router();
/**
 * Public middleware.
 */
routerPublic.use(expressLayouts);
routerPublic.use(
  // Content-Type: application/x-www-form-urlencoded.
  bodyParser.urlencoded({
    extended: false
  })
);
/**
 * Public home page and favicon.
 */
routerPublic.use(favicon("library/static/favicon.ico"));
routerPublic.get("/", (req, res) => {
  res.render("home");
});
/**
 * Public security controller.
 */
const SecurityController = require("./controllers/public/SecurityController");
const securityController = new SecurityController();
routerPublic.use(securityController.initRouter());
/**
 * Public error handler.
 */
routerPublic.use((err, req, res, next) => {
  console.log("err: ", err);
  // HTTP
  if (err.statusCode) res.status(err.statusCode);
  else if (err.status) res.status(err.status);
  // 500 Internal Server Error
  else res.status(500);
  res.render("error", { error: err });
});

/**
 * ------------------------------------------------------
 * API router.
 * ------------------------------------------------------
 */
const routerApi = express.Router();
/**
 * API middleware.
 */
routerApi.use(
  // Content-Type: application/json
  bodyParser.json()
);
/**
 * API user endpoint.
 */
const UserEndpoint = require("./controllers/api/UserEndpoint");
const userEndpoint = new UserEndpoint();
routerApi.use(userEndpoint.initRouter());
/**
 * API error handler.
 */
routerApi.use((err, req, res, next) => {
  console.log("err: ", err);
  // Validation
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      errors: err.data
    });
  }
  // HTTP.
  if (err.statusCode) res.status(err.statusCode);
  else if (err.status) res.status(err.status);
  // 500 Internal Server Error.
  else res.status(500);
  res.json({
    error: {
      name: err.name,
      message: err.message
    }
  });
});

/**
 * ------------------------------------------------------
 * Create Express server.
 * ------------------------------------------------------
 */
const app = express();
// Log routes.
app.use(
  logger((tokens, req, res) => {
    const message = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      "-",
      tokens["response-time"](req, res),
      "ms"
    ].join(" ");
    return chalk.yellow(message);
  })
);
// View engine.
app.set("view engine", "ejs");
// Public routes.
app.use("/", routerPublic);
// API routes.
app.use("/api/", routerApi);
// Server.
const PORT = 8080;
const NAME = config.name;
app.listen(PORT, () => console.log(`${NAME} listening on ${PORT}`));
