const path = require("path");
const express = require("express");
const expressStatusMonitor = require("express-status-monitor");
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
const { Model } = require("objection");
Model.knex(knex);

/**
 * Public route and handlers.
 */
const routerPublic = express.Router();
routerPublic.use(
  bodyParser.urlencoded({
    extended: false
  })
);
routerPublic.use(bodyParser.json());
const SecurityController = require("./public/SecurityController");
const securityController = new SecurityController();
securityController.initRoute(routerPublic);

/**
 * API route and handlers.
 */
const routerApi = express.Router();
const UserEndpoint = require("./api/UserEndpoint");
const userEndpoint = new UserEndpoint();
userEndpoint.initRoutes(routerApi);

/**
 * Create Express server.
 */
const app = express();
app.use(favicon("public/favicon.ico"));
app.use("/", routerPublic);
app.use("/api/", routerApi);
const PORT = 80;
app.listen(PORT, () => console.log(`Node app listening on port ${PORT}`));
