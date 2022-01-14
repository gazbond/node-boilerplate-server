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
  getField,
  getFields,
  getHeader,
  getBody
} = require("../../library/helpers/utils");
const cors = require("cors");

// ElasticSearch.
const { elastic } = require("../../config");

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
    this.check.sort = check("sort", "Param 'sort' isn't JSON")
      .optional()
      .isJSON();
    this.check.xSort = check("xSort", "Header 'xSort' isn't JSON")
      .optional()
      .isJSON();
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
    // Must be before other routes
    this.router.get(
      "/users/me",
      [cors(this.cors), this.middleware.me],
      wrapAsync(this.actionMe)
    );
    super.initRouter();
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
    this.router.put(
      this.pathWithParam,
      this.middleware.update.concat(this.validators.update),
      wrapAsync(this.actionUpdate)
    );
    this.router.delete(
      this.pathWithParam,
      this.middleware.delete.concat(this.validators.delete),
      wrapAsync(this.actionDelete)
    );
    return this.router;
  }
  /**
   * GET api/users (using search index)
   */
  async actionIndex(req, res) {
    // Sort and order
    let sort = getHeader(req, "X-Sort", getParam(req, "sort", null));
    let order = getHeader(req, "X-Order", getParam(req, "order", null));
    // Use relational database
    if (sort && order) {
      return super.actionIndex(req, res);
    }
    // Validation
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send({
        errors: errors.mapped()
      });
    }
    // Filter
    let filter = getHeader(req, "X-Filter", getParam(req, "filter", null));
    if (filter) {
      filter = JSON.parse(filter);
    } else {
      filter = {
        match_all: {}
      };
    }
    // Pagination
    const perPage = getHeader(
      req,
      "X-Pagination-Per-Page",
      getParam(req, "perPage", 30)
    );
    // Indexed from 1
    const currentPage = getHeader(
      req,
      "X-Pagination-Current-Page",
      getParam(req, "page", 1)
    );
    // Indexed from 0
    const page = currentPage > 0 ? currentPage - 1 : 0;
    // Search config
    const config = {
      index: User.indexName,
      type: User.indexType,
      body: {
        query: filter
      },
      from: perPage * page,
      size: perPage
    };
    if (sort) {
      config.sort = sort;
    }
    // Search
    const response = await elastic.search(config);

    const results = [];
    response.body.hits.hits.forEach(result => {
      results.push(getBody(User, result));
    });
    const total = response.body.hits.total;
    const pageCount = Math.ceil(total / perPage);
    // Headers
    res.header({
      "X-Pagination-Total-Count": total,
      "X-Pagination-Current-Page": currentPage,
      "X-Pagination-Per-Page": perPage,
      "X-Pagination-Page-Count": pageCount,
      // For react-admin
      "Content-Range":
        this.path.replace("/", "") + " 0-" + pageCount + "/" + total
    });
    // 200 OK
    res.status(200).send(results);
  }
  /**
   * Overridden delete action (set status to deleted)
   */
   async actionDelete(req, res) {
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send(errors.mapped());
    }
    const id = getParam(req, "id");
    const model = await this.Model.query().findById(id);
    if (!model || model.status == "deleted") {
      // 404 Not Found
      return res.status(404).end();
    }
    await model.delete();
    // 200 OK
    res.status(200).end();
  }
  /**
   * Overridden update action (ignore status deleted)
   */
  async actionUpdate(req, res) {
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send(errors.mapped());
    }
    const id = getParam(req, "id");
    const model = await this.Model.query().findById(id);
    if (!model || model.status == "deleted") {
      // 404 Not Found
      return res.status(404).end();
    }
    const patch = getFields(req, this.Model);
    await model.$query().patchAndFetch(patch);
    // 200 OK
    res.status(200).send(model);
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
