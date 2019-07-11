const BaseEndpoint = require("../../library/BaseEndpoint");
const User = require("../../models/User");
const Role = require("../../models/rbac/Role");
const { buildCheckFunction } = require("express-validator/check");
const check = buildCheckFunction(["params", "body"]);
const passport = require("../../library/helpers/passport");
const rbac = require("../../library/helpers/rbac");
const {
  validationErrors,
  bindMethods,
  wrapAsync,
  getParam,
  getField
} = require("../../library/helpers/utils");

/**
 * User endpoint exposes User model over http.
 * Also provides users/me endpoint for returning owner of jwt token.
 */
module.exports = class UserEndpoint extends BaseEndpoint {
  constructor() {
    super(User, "/users");
    this.check.name = check("name", "Param 'name' missing or not a string")
      .exists({
        checkNull: true,
        checkFalsy: true
      })
      .isString();
    this.validators.assign = [this.check.id, this.check.name];
    this.validators.remove = [this.check.id, this.check.name];
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
    this.middleware.assign = writeMiddleware;
    this.middleware.remove = writeMiddleware;
    this.eager = "roles.permissions";
    bindMethods(this, ["actionMe", "actionAssignRole", "actionRemoveRole"]);
  }
  initRouter() {
    this.router.get("/users/me", this.middleware.me, wrapAsync(this.actionMe));
    this.router.post(
      "/users/:id/role",
      this.middleware.assign.concat(this.validators.assign),
      wrapAsync(this.actionAssignRole)
    );
    this.router.delete(
      "/users/:id/role/:name",
      this.middleware.remove.concat(this.validators.remove),
      wrapAsync(this.actionRemoveRole)
    );
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
  /**
   * POST security/users/:id/role
   */
  async actionAssignRole(req, res) {
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send(errors.mapped());
    }
    const user_id = getParam(req, "id");
    const user = await User.query().findById(user_id);
    if (!user) {
      // 404 Not Found
      return res.status(404).end();
    }
    const name = getField(req, "name");
    const role = await Role.query().findById(name);
    if (!role) {
      // 404 Not Found
      return res.status(404).end();
    }
    await user.assignRole(role);
    await user.$relatedQuery("roles").eager("permissions");
    // 200 OK
    res.status(200).send(user);
  }
  /**
   * DELETE security/users/:id/role/:name
   */
  async actionRemoveRole(req, res) {
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send(errors.mapped());
    }
    const user_id = getParam(req, "id");
    const user = await User.query().findById(user_id);
    if (!user) {
      // 404 Not Found
      return res.status(404).end();
    }
    const role_name = getParam(req, "name");
    const role = await Role.query().findById(role_name);
    if (!role) {
      // 404 Not Found
      return res.status(404).end();
    }
    await user.removeRole(role);
    await user.$relatedQuery("roles").eager("permissions");
    // 200 OK
    res.status(200).send(user);
  }
};
