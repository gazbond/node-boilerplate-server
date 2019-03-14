const {
  buildCheckFunction,
  validationResult
} = require("express-validator/check");
const check = buildCheckFunction(["body", "query"]);

const BaseEndpoint = require("../lib/BaseEndpoint");
const User = require("../models/User");
const passport = require("../lib/helpers/passport");
const rbac = require("../lib/helpers/rbac");

/**
 * User endpoint exposes User model over http.
 */
module.exports = class UserEndpoint extends BaseEndpoint {
  /**
   * Configuration.
   */
  constructor() {
    super(User);
    // Options:
    this.route = "/users";
    this.routeWithId = "/users/:id";
    // Route handlers:
    this.handlers = [passport.jwt.auth, rbac.init, rbac.auth.isInRole("admin")];
  }
  /**
   * Uses json param 'q'
   */
  async index(req, res, next) {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send(errors.mapped());
    }
    const users = await this.Model.query();
    // 200 OK
    res.status(200).send(users);
  }
  async create(req, res, next) {
    // 501 Not Implemented
    res.status(501).end();
  }
  async update(req, res, next) {
    // 501 Not Implemented
    res.status(501).end();
  }
};
