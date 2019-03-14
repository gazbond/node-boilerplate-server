const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");
const BaseClass = DbErrors(Model);

module.exports = class RoleAssignment extends BaseClass {
  static get tableName() {
    return "rbac_role_assignment";
  }
  static get idColumn() {
    return ["role_name", "user_id"];
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: ["role_name", "user_id"],
      properties: {
        role_name: { type: "string", minLength: 1, maxLength: 64 },
        user_id: { type: "integer" }
      }
    };
  }
};
