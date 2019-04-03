const BaseEndpoint = require("../../library/BaseEndpoint");
const User = require("../../models/User");
const passport = require("../../library/helpers/passport");
const rbac = require("../../library/helpers/rbac");
const { bindMethods, wrapAsync } = require("../../library/helpers/utils");

/**
 * User endpoint exposes User model over http.
 * Also provides users/me endpoint for returning owner of jwt token.
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
    this.middleware.me = readMiddleware;
    this.eager = "roles.permissions";
    bindMethods(this, ["actionMe"]);
  }
  initRouter() {
    this.router.get("/users/me", this.middleware.me, wrapAsync(this.actionMe));
    super.initRouter();
    return this.router;
  }
  /**
   * GET api/users
   */
  async actionIndex(req, res) {
    return super.actionIndex(req, res);
  }
  /**
   * GET api/users/me
   */
  async actionMe(req, res) {
    const user = req.user;
    if (!user) {
      // 404 Not Found
      return res.status(404).end();
    }
    // // 200 OK
    res.status(200).send(user);
  }
};
