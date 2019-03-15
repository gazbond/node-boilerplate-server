const express = require("express");
const { wrapAsync } = require("./helpers/utils");

/**
 * Base class for exposing models over http.
 */
module.exports = class BassEndpoint {
  /**
   * Configuration.
   */
  constructor(model) {
    // Pass in from subclass:
    this.Model = model;
    // Options (set these is subclass):
    this.route = null;
    this.routeWithId = null;
    // Route handlers (set this is subclass):
    this.handlers = [];
    // Router:
    this.router = express.Router();
    // To get 'this' in instance methods:
    this.initRoutes = this.initRoutes.bind(this);
    this.view = this.view.bind(this);
    this.delete = this.delete.bind(this);
    this.index = this.index.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
  }
  /**
   * Returns express.Router() configured with routes/middleware.
   */
  initRoutes() {
    // Routes:
    this.router.get(this.route, this.handlers, wrapAsync(this.index));
    this.router.get(this.routeWithId, this.handlers, wrapAsync(this.view));
    this.router.post(this.route, this.handlers, wrapAsync(this.create));
    this.router.put(this.routeWithId, this.handlers, wrapAsync(this.update));
    this.router.delete(this.route, this.handlers, wrapAsync(this.delete));
    return this.router;
  }
  // Default implementations:
  async view(req, res, next) {
    if (!req.params.id) {
      // 400 Bad Request
      return res.status(400).send("Missing required param 'id'");
    }
    const user = await this.Model.query().findById(req.params.id);
    if (!user) {
      // 404 Not Found
      return res.status(404).end();
    }
    res.status(200).send(user);
  }
  async delete(req, res, next) {
    if (!req.params.id) {
      // 400 Bad Request
      return res.status(400).send("Missing required param 'id'");
    }
    const rowsDeleted = await this.Model.query().deleteById(req.params.id);
    // 200 OK
    res.status(200).send(rowsDeleted);
  }
  // Not implemented. Requires validation config (handle in subclass):
  async index(req, res, next) {
    // 501 Not Implemented
    res.status(501).end();
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
