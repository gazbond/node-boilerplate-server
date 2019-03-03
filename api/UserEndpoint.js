// For intellisense, can comment out.
const User = require("../models/User");

module.exports = class UserEndpoint {
  /**
   * @param {User} model User model class i.e. db.User
   */
  constructor(model) {
    this.knex = model.knex;
    this.User = model;
    // To get 'this' in instance methods:
    this.actionIndex = this.actionIndex.bind(this);
    this.actionView = this.actionView.bind(this);
    this.actionCreate = this.actionCreate.bind(this);
    this.actionUpdate = this.actionUpdate.bind(this);
    this.actionDelete = this.actionDelete.bind(this);
  }
  async actionIndex(req, res) {
    const users = await this.User.query();
    res.status(200).send(users);
  }
  async actionView(req, res) {
    const user = await this.User.query().findById(req.params.id);
    res.status(200).send(user);
  }
  async actionCreate(req, res) {
    res.status(501).end();
  }
  async actionUpdate(req, res) {
    res.status(501).end();
  }
  async actionDelete(req, res) {
    res.status(501).end();
  }
};
