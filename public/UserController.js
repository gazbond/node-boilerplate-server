// For intellisense, can comment out.
const User = require("../models/User");

module.exports = class UserController {
  /**
   * @param {User} model User model class i.e. db.User
   */
  constructor(model, config) {
    this.knex = model.knex;
    this.User = model;
    Object.assign(this, config);
  }
  actionLogin(req, res) {
    res.status(501).end();
  }
  actionRegister(req, res) {
    res.status(501).end();
  }
};
