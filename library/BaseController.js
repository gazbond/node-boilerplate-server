const express = require("express");
const { bindMethods } = require("./helpers/utils");

/**
 * Bass class for public endpoints.
 */
module.exports = class BassController {
  /**
   * Configuration.
   */
  constructor() {
    // Router:
    this.router = express.Router();
    // Paths:
    this.paths = {};
    // Validations (set this is subclass):
    this.validators = {};
    // Middleware (set this is subclass):
    this.middleware = {};
    // To get 'this' in instance methods:
    bindMethods(this, ["initRouter"]);
  }
  /**
   * Abstract: returns express.Router() configured with paths/middleware.
   */
  initRouter() {}
};
