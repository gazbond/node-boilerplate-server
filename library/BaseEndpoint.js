const express = require("express");
const Request = express.request;
const Response = express.response;
const Router = express.Router;
const cors = require("cors");
const { buildCheckFunction } = require("express-validator/check");
const check = buildCheckFunction(["params", "query"]);
const {
  validationErrors,
  bindMethods,
  wrapAsync,
  getParam,
  getFields
} = require("./helpers/utils");

/**
 * Base class for exposing models over http.
 */
module.exports = class BassEndpoint {
  /**
   * Configuration.
   * @param {Object} model
   * @param {string} path
   * @param {string} param
   */
  constructor(model, path, param = "/:id") {
    // Model:
    this.Model = model;
    // Router:
    this.router = express.Router();
    // Paths:
    this.path = path;
    this.pathWithParam = path + param;
    // Cores:
    this.cors = {
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    };
    // Validations:
    this.check = {
      id: check("id", "Param 'id' missing or not an integer")
        .exists({
          checkNull: true,
          checkFalsy: true
        })
        .isInt(),
      page: check("page", "Param 'page' is not an integer")
        .optional()
        .isInt(),
      size: check("size", "Param 'size' is not an integer")
        .optional()
        .isInt()
    };
    this.validators = {
      index: [this.check.page, this.check.size],
      view: [this.check.id],
      create: [],
      update: [this.check.id],
      delete: [this.check.id]
    };
    // Middleware:
    this.middleware = {
      index: [],
      view: [],
      create: [],
      update: [],
      delete: []
    };
    // Get 'this' in instance methods:
    bindMethods(this, [
      "initRouter",
      "actionIndex",
      "actionView",
      "actionCreate",
      "actionUpdate",
      "actionDelete"
    ]);
  }
  /**
   * @return {Router} express.Router() configured with paths/middleware.
   */
  initRouter() {
    this.router.use(this.path, cors(this.cors));
    this.router.get(
      this.path,
      this.middleware.index.concat(this.validators.index),
      wrapAsync(this.actionIndex)
    );
    this.router.get(
      this.pathWithParam,
      this.middleware.view.concat(this.validators.view),
      wrapAsync(this.actionView)
    );
    this.router.post(
      this.path,
      this.middleware.create.concat(this.validators.create),
      wrapAsync(this.actionCreate)
    );
    this.router.put(
      this.pathWithParam,
      this.middleware.update.concat(this.validators.update),
      wrapAsync(this.actionUpdate)
    );
    this.router.delete(
      this.path,
      this.middleware.delete.concat(this.validators.delete),
      wrapAsync(this.actionDelete)
    );
    return this.router;
  }
  /**
   * @param {Request} req
   * @param {Response} res
   */
  async actionIndex(req, res) {
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send({
        errors: errors.mapped()
      });
    }
    const page = getParam(req, "page", 0);
    const size = getParam(req, "size", 30);
    const models = await this.Model.query().page(page, size);
    // 200 OK
    res.status(200).send(models);
  }
  /**
   * @param {Request} req
   * @param {Response} res
   */
  async actionView(req, res) {
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send({
        errors: errors.mapped()
      });
    }
    const id = getParam(req, "id");
    const model = await this.Model.query().findById(id);
    if (!model) {
      // 404 Not Found
      return res.status(404).end();
    }
    // 200 OK
    res.status(200).send(model);
  }
  /**
   * @param {Request} req
   * @param {Response} res
   */
  async actionCreate(req, res) {
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send(errors.mapped());
    }
    const insert = getFields(req, this.Model);
    const model = await this.Model.query().insertAndFetch(insert);
    if (!model) {
      // 404 Not Found
      return res.status(404).end();
    }
    // 200 OK
    res.status(200).send(model);
  }
  /**
   * @param {Request} req
   * @param {Response} res
   */
  async actionUpdate(req, res) {
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send(errors.mapped());
    }
    const id = getParam(req, "id");
    const model = await this.Model.query().findById(id);
    if (!model) {
      // 404 Not Found
      return res.status(404).end();
    }
    const patch = getFields(req, this.Model);
    await model.$query().patchAndFetch(patch);
    // 200 OK
    res.status(200).send(model);
  }
  /**
   * @param {Request} req
   * @param {Response} res
   */
  async actionDelete(req, res) {
    const errors = validationErrors(req);
    if (!errors.isEmpty()) {
      // 400 Bad Request
      return res.status(400).send(errors.mapped());
    }
    const id = getParam(req, "id");
    const result = await this.Model.query().deleteById(id);
    if (!result) {
      // 404 Not Found
      return res.status(404).end();
    }
    // 200 OK
    res.status(200).end();
  }
};
