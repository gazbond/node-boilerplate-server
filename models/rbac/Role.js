const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");
const BaseClass = DbErrors(Model);

const Permission = require("./Permission");

module.exports = class Role extends BaseClass {
  static get tableName() {
    return "rbac_role";
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
  static get relationMappings() {
    return {
      permissions: {
        relation: Model.ManyToManyRelation,
        modelClass: Permission,
        join: {
          from: "rbac_role.name",
          through: {
            from: "rbac_permission_assignment.role_name",
            to: "rbac_permission_assignment.permission_name"
          },
          to: "rbac_permission.name"
        }
      }
    };
  }
  static assignPermission() {}
};
