const express = require("express");
const { check, validationResult } = require("express-validator/check");

const User = require("../models/User");
const BaseEndpoint = require("../lib/BaseEndpoint");

module.exports = class UserEndpoint extends BaseEndpoint {
  constructor() {
    super(User);
    // Options:
    this.route = "/users";
    this.routeWithId = "/users/:id";
    // Validation:
    this.queryValidation = [check("q").isJSON()];
  }
  initRoutes(router) {
    super.initRoutes(router);
    const newRouter = express.Router();
    // Replace routes:
    newRouter.post(this.route, this.queryValidation, this.actionIndex);
  }
  async actionIndex(req, res) {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array());
    }
    const users = await this.Model.query();
    return res.status(200).send(users);
  }
  async actionCreate(req, res) {
    return res.status(501).end();
  }
  async actionUpdate(req, res) {
    return res.status(501).end();
  }
};
