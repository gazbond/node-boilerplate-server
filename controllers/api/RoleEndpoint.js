const BaseEndpoint = require("../../library/BaseEndpoint");
const Role = require("../../models/rbac/Role");
const Permission = require("../../models/rbac/Permission");
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

// ElasticSearch.
const { elastic } = require("../../config");

/**
 * Role endpoint exposes Role model over http.
 */
module.exports = class RoleEndpoint extends BaseEndpoint {
  constructor() {
    super(Role, "/roles");
    this.check.id = check("id", "Param 'id' missing or not a string")
      .exists({
        checkNull: true,
        checkFalsy: true
      })
      .isString();
    this.check.name = check("name", "Param 'name' missing or not a string")
      .exists({
        checkNull: true,
        checkFalsy: true
      })
      .isString();
    this.validators.view = [this.check.id];
    this.validators.create = [this.check.name];
    this.validators.delete = [this.check.id];
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
    this.middleware.assign = writeMiddleware;
    this.middleware.remove = writeMiddleware;
    this.eager = "permissions";
    bindMethods(this, ["actionAssignPermission", "actionRemovePermission"]);
  }
  initRouter() {
    super.initRouter();
    this.router.post(
      "/roles/:id/permission",
      this.middleware.assign.concat(this.validators.assign),
      wrapAsync(this.actionAssignPermission)
    );
    this.router.delete(
      "/roles/:id/permission/:name",
      this.middleware.remove.concat(this.validators.remove),
      wrapAsync(this.actionRemovePermission)
    );
    return this.router;
  }
  /**
   * POST security/roles/:id/permission
   */
  async actionAssignPermission(req, res) {
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send(errors.mapped());
    }
    const role_id = getParam(req, "id");
    const role = await this.Model.query().findById(role_id);
    if (!role) {
      // 404 Not Found
      return res.status(404).end();
    }
    const perm_name = getField(req, "name");
    const permission = await Permission.query().findById(perm_name);
    if (!permission) {
      // 404 Not Found
      return res.status(404).end();
    }
    await role.assignPermission(permission);
    await role.$relatedQuery("permissions");
    // 200 OK
    res.status(200).send(role);
  }
  /**
   * DELETE security/roles/:id/permission/:name
   */
  async actionRemovePermission(req, res) {
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send(errors.mapped());
    }
    const role_id = getParam(req, "id");
    const role = await this.Model.query().findById(role_id);
    if (!role) {
      // 404 Not Found
      return res.status(404).end();
    }
    const perm_name = getParam(req, "name");
    const permission = await Permission.query().findById(perm_name);
    if (!permission) {
      // 404 Not Found
      return res.status(404).end();
    }
    await role.removePermission(permission);
    await role.$relatedQuery("permissions");
    // 200 OK
    res.status(200).send(role);
  }
  /**
   * Stub out update action (foreign key constraints).
   */
  async actionUpdate(req, res) {
    // 501 Not Implemented
    return res.status(501).end();
  }
  /**
   * Fixes getFields(req, Model) excludes id column.
   */
  async actionCreate(req, res) {
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send(errors.mapped());
    }
    const insert = {
      name: getField(req, "name")
    };
    const model = await this.Model.query().insertAndFetch(insert);
    if (!model) {
      // 404 Not Found
      return res.status(404).end();
    }
    // 200 OK
    res.status(200).send(model);
  }
  /**
   * Using 'name' not 'id' for primary key.
   */
  async actionView(req, res) {
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send({
        errors: errors.mapped()
      });
    }
    const name = getParam(req, "id");
    const model = await this.Model.query()
      .eager(this.eager)
      .findOne({ name: name });
    if (!model) {
      // 404 Not Found
      return res.status(404).end();
    }
    // 200 OK
    res.status(200).send(model);
  }
};
