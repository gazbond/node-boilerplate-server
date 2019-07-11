const BaseEndpoint = require("../../library/BaseEndpoint");
const Permission = require("../../models/rbac/Permission");
const passport = require("../../library/helpers/passport");
const { buildCheckFunction } = require("express-validator/check");
const check = buildCheckFunction(["params", "body"]);
const rbac = require("../../library/helpers/rbac");
const { validationErrors, getField } = require("../../library/helpers/utils");

/**
 * Permission endpoint exposes Permission model over http.
 */
module.exports = class PermissionEndpoint extends BaseEndpoint {
  constructor() {
    super(Permission, "/permissions");
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
};
