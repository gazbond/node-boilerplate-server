const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");
const BaseClass = DbErrors(Model);

module.exports = class Permission extends BaseClass {
  static get tableName() {
    return "rbac_permission";
  }
  static get idColumn() {
    return "name";
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", minLength: 1, maxLength: 64 }
      }
    };
  }
};
