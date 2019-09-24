const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const Password = require("objection-password")();
const Unique = require("objection-unique")({
  fields: ["email", "username"],
  identifiers: ["id"]
});
const BaseClass = Password(Unique(BaseModel));

const crypto = require("crypto-promise");
const {
  name,
  baseUrl,
  models: {
    user: { emailConfirmation, roles }
  }
} = require("../config");
const { sendEmail } = require("../library/helpers/email");
const Role = require("./rbac/Role");
const RoleAssignment = require("./rbac/RoleAssignment");
const Token = require("./Token");

class User extends BaseClass {
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
        status: {
          type: "string",
          enum: ["unconfirmed", "active", "suspended", "deleted"]
        },
        username: { type: "string", minLength: 3, maxLength: 25 },
        email: { type: "string", format: "email" },
        password: {
          type: "string",
          minLength: 8,
          maxLength: 60,
          pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"
        }
      }
    };
  }
  static get fields() {
    return ["username", "email", "password"];
  }
  static get visible() {
    return [
      "id",
      "username",
      "email",
      "roles",
      "created_at",
      "confirmed_at",
      "updated_at"
    ];
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
      },
      tokens: {
        relation: Model.HasManyRelation,
        modelClass: Token,
        join: {
          from: "user_identity.id",
          to: "user_token.user_id"
        }
      }
    };
  }
  static get indexName() {
    return "users";
  }
  static get indexType() {
    return "user";
  }
  static get indexMappings() {
    return {
      dynamic: "strict",
      properties: {
        id: { type: "long" },
        username: { type: "text" },
        email: { type: "text" },
        roles: { type: "nested" },
        confirmed_at: { type: "date" },
        created_at: { type: "date" },
        updated_at: { type: "date" }
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
   * Create token and email confirm link.
   */
  async sendConfirmationEmail() {
    // Create token
    const token = await Token.query().insertAndFetch({
      type: Token.TYPE_CONFIRMATION,
      user_id: this.id
    });
    // Send confirmation email
    await sendEmail(this.email, "confirmation", {
      name: name,
      username: this.username,
      url: `${baseUrl}/security/confirm/${token.user_id}/${token.code}`
    });
  }
  /**
   * Create token and email password recovery link.
   */
  async sendRecoveryEmail() {
    // Create token
    const token = await Token.query().insertAndFetch({
      type: Token.TYPE_RECOVERY,
      user_id: this.id
    });
    // Send confirmation email
    await sendEmail(this.email, "recovery", {
      name: name,
      username: this.username,
      url: `${baseUrl}/security/password/${token.user_id}/${token.code}`
    });
  }
  /**
   * Generate auth key, assign default role(s).
   */
  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    // Set auth key to random string of length 32 (2 per hex i.e. 16 bytes)
    const buffer = await crypto.randomBytes(16);
    this.auth_key = buffer.toString("hex");
  }
  /**
   * Assign default role(s), send confirmation email and update index.
   */
  async $afterInsert(queryContext) {
    // Add roles
    if (roles && roles.length > 0) {
      await this.assignRoles(roles);
    }
    // Send confirm email
    if (emailConfirmation) {
      await this.sendConfirmationEmail();
    }
    await super.$afterInsert(queryContext);
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
    // Load tokens
    const tokens = await this.$relatedQuery("tokens");
    // Remove tokens
    if (tokens && tokens.length > 0) {
      const deletes = [];
      tokens.forEach(token => {
        deletes.push([token.type, token.user_id, token.code]);
      });
      await Token.query()
        .delete()
        .whereInComposite(["type", "user_id", "code"], deletes);
    }
  }
}

module.exports = User;
