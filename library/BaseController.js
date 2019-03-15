const express = require("express");

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
    // Route handlers (set this is subclass):
    this.handlers = [];
    // To get 'this' in instance methods:
    this.initRoutes = this.initRoutes.bind(this);
  }
  /**
   * Abstract: return express.Router() configured with routes/middleware.
   */
  initRoutes() {}
};
