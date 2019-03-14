const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");
const BaseClass = DbErrors(Model);

module.exports = class PermissionAssignment extends BaseClass {
  static get tableName() {
    return "rbac_permission_assignment";
  }
  static get idColumn() {
    return ["permission_name", "role_name"];
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: ["permission_name", "role_name"],
      properties: {
        permission_name: { type: "string", minLength: 1, maxLength: 64 },
        role_name: { type: "string", minLength: 1, maxLength: 64 }
      }
    };
  }
};
