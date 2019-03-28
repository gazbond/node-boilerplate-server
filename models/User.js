const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const Password = require("objection-password")();
const Unique = require("objection-unique")({
  fields: ["email", "username"],
  identifiers: ["id"]
});
const BaseClass = Password(Unique(BaseModel));

const crypto = require("crypto-promise");
const config = require("../config");
const { sendEmail } = require("../library/helpers/email");

const Role = require("./rbac/Role");
const RoleAssignment = require("./rbac/RoleAssignment");

module.exports = class User extends BaseClass {
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
        password: { type: "string", minLength: 0, maxLength: 60 }
      }
    };
  }
  static get fields() {
    return ["username", "email", "password"];
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
   * Make intellisense work after objection-password breaks it.
   */
  static query() {
    return super.query();
  }
  /**
   * @param {Role|string} role
   */
  async assignRole(role) {
    let roleName = role;
    if (typeof role === "object") {
      roleName = role.name;
    }
    await RoleAssignment.query().insert({
      role_name: roleName,
      user_id: this.id
    });
  }
  /**
   * @param {Role|string} role
   */
  async removeRole(role) {
    let roleName = role;
    if (typeof role === "object") {
      roleName = role.name;
    }
    await RoleAssignment.query().deleteById([roleName, this.id]);
  }
  /**
   * @param {Role[]|string[]} roles
   */
  async assignRoles(roles) {
    const inserts = [];
    roles.forEach(role => {
      let roleName = role;
      if (typeof role === "object") {
        roleName = role.name;
      }
      inserts.push({
        role_name: roleName,
        user_id: this.id
      });
    });
    await RoleAssignment.query().insert(inserts);
  }
  /**
   * @param {Role[]|string[]} roles
   */
  async removeRoles(roles) {
    const deletes = [];
    roles.forEach(role => {
      let roleName = role;
      if (typeof role === "object") {
        roleName = role.name;
      }
      deletes.push([roleName, this.id]);
    });
    await RoleAssignment.query()
      .delete()
      .whereInComposite(["role_name", "user_id"], deletes);
  }
  /**
   * Generate auth key.
   */
  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    // Set auth key to random string of length 32 (2 per hex i.e. 16 bytes)
    const buffer = await crypto.randomBytes(16);
    this.auth_key = buffer.toString("hex");
  }
  /**
   * Assign default role(s) and send confirmation email.
   */
  async $afterInsert(queryContext) {
    await super.$afterInsert(queryContext);
    // Add roles
    const roles = config.models.user.roles || false;
    if (roles && roles.length > 0) {
      await this.assignRoles(roles);
    }
    // Send confirmation email
    const emailConfirmation = config.models.user.emailConfirmation || false;
    if (emailConfirmation) {
      await sendEmail(this.email, "register", {
        name: config.name,
        username: this.username,
        url: "link-goes-here"
      });
    }
  }
  /**
   * Remove role assignments.
   */
  async $beforeDelete(queryContext) {
    await super.$beforeDelete(queryContext);
    // Load roles
    const roles = await this.$relatedQuery("roles");
    // Remove role assignments
    if (roles && roles.length > 0) {
      await this.removeRoles(roles);
    }
  }
};
