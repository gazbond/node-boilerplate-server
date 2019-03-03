const path = require("path");
const express = require("express");
const expressValidator = require("express-validator");
const expressStatusMonitor = require("express-status-monitor");
const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const logger = require("morgan");
const favicon = require("serve-favicon");

/**
 * Knex database with Objection models (db).
 */
const environment = process.env.ENVIRONMENT || "development";
const config = require("./knexfile")[environment];
const knex = require("knex")(config);
const db = require("./models")(knex);

/**
 * Route handlers.
 */
const routerPublic = express.Router();
const routeGetAndPost = (route, func) => {
  routerPublic.get(route, func);
  routerPublic.post(route, func);
};
const routerApi = express.Router();
const routeRESTful = (route, endpoint) => {
  routerApi.get(route, endpoint["actionIndex"]);
  routerApi.get(route + "/:id", endpoint["actionView"]);
  routerApi.post(route, endpoint["actionCreate"]);
  routerApi.put(route + "/:id", endpoint["actionUpdate"]);
  routerApi.delete(route, endpoint["actionDelete"]);
};

const UserController = require("./public/UserController");
const userController = new UserController(db.User, {});
routeGetAndPost("/user/login", userController.actionLogin);
routeGetAndPost("/user/register", userController.actionRegister);

const UserEndpoint = require("./api/UserEndpoint");
const userEndpoint = new UserEndpoint(db.User, {});
routeRESTful("/users", userEndpoint);

/**
 * Create Express server.
 */
const app = express();
app.use(favicon("public/favicon.ico"));
app.use("/", routerPublic);
app.use("/api/", routerApi);
const port = 80;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));
