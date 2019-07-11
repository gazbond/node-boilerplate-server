const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");
const VisibilityPlugin = require("objection-visibility").default;
const BaseClass = DbErrors(VisibilityPlugin(Model));

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
  static get fields() {
    return ["name"];
  }
  static get visible() {
    return ["name"];
  }
};
