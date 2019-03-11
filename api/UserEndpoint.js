const User = require("../models/User");
const BaseEndpoint = require("./BaseEndpoint");

module.exports = class UserEndpoint extends BaseEndpoint {
  constructor() {
    super(User);
    // Options:
    this.route = "/users";
    this.routeWithId = "/users/:id";
  }
  initRoutes(router) {
    super.initRoutes(router);
  }
  async actionIndex(req, res) {
    const users = await this.Model.query();
    return res.status(200).send(users);
  }
  async actionCreate(req, res) {
    return res.status(501).end();
  }
  async actionUpdate(req, res) {
    return res.status(501).end();
  }
};
