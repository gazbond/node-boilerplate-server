const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");
const BaseClass = DbErrors(Model);

module.exports = class Submission extends BaseClass {
  static get tableName() {
    return "app_submission";
  }
  static get idColumn() {
    return "id";
  }
  static get jsonSchema() {
    return {};
  }
  static get relationMappings() {
    return {};
  }
};
