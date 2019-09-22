const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");
const BaseClass = DbErrors(Model);

module.exports = class Comment extends BaseClass {
  static get tableName() {
    return "app_comment";
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
