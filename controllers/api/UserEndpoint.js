const BaseEndpoint = require("../../library/BaseEndpoint");
const User = require("../../models/User");
const passport = require("../../library/helpers/passport");
const rbac = require("../../library/helpers/rbac");

/**
 * User endpoint exposes User model over http.
 */
module.exports = class UserEndpoint extends BaseEndpoint {
  constructor() {
    super(User, "/users");
    const readMiddleware = [
      passport.auth,
      rbac.auth,
      rbac.hasPermission("can-read-api")
    ];
    const writeMiddleware = [
      passport.auth,
      rbac.auth,
      rbac.hasPermission("can-write-api")
    ];
    this.middleware.index = readMiddleware;
    this.middleware.view = readMiddleware;
    this.middleware.create = writeMiddleware;
    this.middleware.update = writeMiddleware;
    this.middleware.delete = writeMiddleware;
  }
  async actionIndex(req, res) {
    return super.actionIndex(req, res);
  }
};
