const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");

module.exports = class BaseModel extends DbErrors(Model) {
  static $beforeInsert() {
    this.created_at = new Date().toISOString();
  }
  static $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }
};
