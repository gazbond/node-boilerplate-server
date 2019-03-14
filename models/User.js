const crypto = require("crypto-promise");
const { Model } = require("objection");
const BaseModel = require("../lib/BaseModel");
const Password = require("objection-password")({
  passwordField: "password_hash"
});
const Role = require("./rbac/Role");
const RoleAssignment = require("./rbac/RoleAssignment");

module.exports = class User extends Password(BaseModel) {
  static get tableName() {
    return "user_identity";
  }
  static get idColumn() {
    return "id";
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: ["username", "email"],
      properties: {
        id: { type: "integer" },
        username: { type: "string", minLength: 1, maxLength: 25 },
        email: { type: "string", format: "email" },
        password_hash: { type: "string", minLength: 0, maxLength: 60 },
        auth_key: { type: "string", minLength: 0, maxLength: 32 }
      }
    };
  }
  static get visible() {
    return ["id", "username", "email", "auth_key", "created_at", "updated_at"];
  }
  static get relationMappings() {
    return {
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: Role,
        join: {
          from: "user_identity.id",
          through: {
            from: "rbac_role_assignment.user_id",
            to: "rbac_role_assignment.role_name"
          },
          to: "rbac_role.name"
        }
      }
    };
  }
  /**
   * @param {Role} role
   */
  async assignRole(role) {
    await RoleAssignment.query().insert({
      role_name: role.name,
      user_id: this.id
    });
  }
  /**
   * @param {Role[]} roles
   */
  async assignRoles(roles) {
    const inserts = [];
    roles.forEach(role => {
      inserts.push({
        role_name: role.name,
        user_id: this.id
      });
    });
    await RoleAssignment.query().insert(inserts);
  }
  $beforeInsert(queryContext) {
    const maybePromise = super.$beforeInsert(queryContext);
    return Promise.resolve(maybePromise).then(async () => {
      // Set auth key to random string of length 32 (2 per hex i.e. 16 bytes)
      const buffer = await crypto.randomBytes(16);
      this.auth_key = buffer.toString("hex");
    });
  }
};
