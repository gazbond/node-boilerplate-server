const path = require("path");
const express = require("express");
const expressStatusMonitor = require("express-status-monitor");
const expressLayouts = require("express-ejs-layouts");
const flash = require("express-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
const logger = require("morgan");
const favicon = require("serve-favicon");

/**
 * Knex database with Objection models (db).
 */
const environment = process.env.ENVIRONMENT || "development";
const config = require("./knexfile")[environment];
const knex = require("knex")(config);
// Log SQL.
knex.on("query", query => {
  console.log("[SQL]", query.sql);
});
// Provide connection to models.
const { Model } = require("objection");
Model.knex(knex);

/**
 * Public router.
 */
const routerPublic = express.Router();
/**
 * Public middleware.
 */
routerPublic.use(expressLayouts);
routerPublic.use(
  // Content-Type: application/x-www-form-urlencoded
  bodyParser.urlencoded({
    extended: false
  })
);
/**
 * Public home page and favicon.
 */
routerPublic.use(favicon("lib/static/favicon.ico"));
routerPublic.get("/", (req, res) => {
  res.render("home");
});
/**
 * Public security controller.
 */
const SecurityController = require("./controllers/public/SecurityController");
const securityController = new SecurityController();
routerPublic.use(securityController.initRoutes());
/**
 * Public error handler.
 */
routerPublic.use((err, req, res, next) => {
  if (err.status) res.status(err.status);
  // 500 Internal Server Error
  else res.status(500);
  res.render("error", { error: err });
});

/**
 * API router.
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
routerApi.use(userEndpoint.initRoutes());
/**
 * API error handler.
 */
routerApi.use((err, req, res, next) => {
  if (err.status) res.status(err.status);
  // 500 Internal Server Error
  else res.status(500);
  res.json({
    error: {
      name: err.name,
      message: err.message
    }
  });
});

/**
 * Create Express server.
 */
const app = express();
app.use(logger("[HTTP] :method :url :status"));
app.set("view engine", "ejs");
app.use("/", routerPublic);
app.use("/api/", routerApi);
const PORT = 8080;
app.listen(PORT, () => console.log(`Node listening on ${PORT}`));
