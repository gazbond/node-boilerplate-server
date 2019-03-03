// For intellisense, can comment out.
const User = require("../models/User");

module.exports = class UserController {
  /**
   * @param {User} model User model class i.e. db.User
   */
  constructor(model) {
    this.knex = model.knex;
    this.User = model;
    // To get 'this' in instance methods:
    this.actionLogin = this.actionLogin.bind(this);
    this.actionRegister = this.actionRegister.bind(this);
  }
  actionLogin(req, res) {
    res.status(200).send("Nothing here yet :(");
  }
  actionRegister(req, res) {
    res.status(501).end();
  }
};
