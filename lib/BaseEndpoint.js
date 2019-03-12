const express = require("express");
const passport = require("../passport");

module.exports = class BassEndpoint {
  constructor(model) {
    // Dependencies:
    this.knex = model.knex;
    this.Model = model;
    // Options:
    this.route = null;
    this.routeWithId = null;
    // To get 'this' in instance methods:
    this.initRoutes = this.initRoutes.bind(this);
    this.actionView = this.actionView.bind(this);
    this.actionDelete = this.actionDelete.bind(this);
    this.actionIndex = this.actionIndex.bind(this);
    this.actionCreate = this.actionCreate.bind(this);
    this.actionUpdate = this.actionUpdate.bind(this);
  }
  initRoutes(router) {
    const newRouter = express.Router();
    // Middleware:
    newRouter.use(passport.initialize);
    // Routes:
    router.get(this.route, passport.authenticate, this.actionIndex);
    router.get(this.routeWithId, passport.authenticate, this.actionView);
    router.post(this.route, passport.authenticate, this.actionCreate);
    router.put(this.routeWithId, passport.authenticate, this.actionUpdate);
    router.delete(this.route, passport.authenticate, this.actionDelete);
    router.use(newRouter);
  }
  // Default implementations:
  async actionView(req, res) {
    if (!req.params.id) {
      // 400 Bad Request
      return res.status(400);
    }
    const user = await this.Model.query().findById(req.params.id);
    return res.status(200).send(user);
  }
  async actionDelete(req, res) {
    if (!req.params.id) {
      // 400 Bad Request
      return res.status(400);
    }
    const rowsDeleted = await this.Model.query().deleteById(req.params.id);
    return res.status(200).send(rowsDeleted);
  }
  // Not implemented. Requires validation config (handled in subclasses):
  async actionIndex(req, res) {
    return res.status(501).end();
  }
  async actionCreate(req, res) {
    return res.status(501).end();
  }
  async actionUpdate(req, res) {
    return res.status(501).end();
  }
};
