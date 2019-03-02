// For intellisense, can comment out.
const User = require("../models/User");

module.exports = class UserEndpoint {
  /**
   * @param {User} model User model class i.e. db.User
   */
  constructor(model, config = {}) {
    this.knex = model.knex;
    this.User = model;
    Object.assign(this, config);
  }
  async actionIndex(req, res) {
    const users = await this.User.query();
    res.status(200).send(users);
  }
  async actionView(req, res) {
    const user = await this.User.query().findById(req.params.id);
    res.status(200).send(user);
  }
  async actionInsert(req, res) {
    res.status(501).end();
  }
  async actionUpdate(req, res) {
    res.status(501).end();
  }
  async actionDelete(req, res) {
    res.status(501).end();
  }
};
