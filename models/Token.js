const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");
const BaseClass = DbErrors(Model);

const ms = require("ms");
const crypto = require("crypto-promise");

const {
  models: { user }
} = require("../config");

/**
 * Token represents a random string belonging to a user.
 * It is used to verify user actions e.g. reset password.
 */
module.exports = class Token extends BaseClass {
  static get tableName() {
    return "user_token";
  }
  static get idColumn() {
    return ["type", "user_id", "code"];
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: ["type", "user_id"],
      properties: {
        type: { type: "integer" },
        user_id: { type: "integer" }
      }
    };
  }
  static get relationMappings() {
    // Lazy loaded to avoid require loop
    const User = require("./User");
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "user_token.user_id",
          to: "user_identity.id"
        }
      }
    };
  }
  static get TYPE_CONFIRMATION() {
    return 0;
  }
  static get TYPE_RECOVERY() {
    return 1;
  }
  /**
   * Check if token has expired.
   */
  expired() {
    // In milliseconds
    const now = new Date().getTime();
    const createdAt = new Date(this.created_at).getTime();
    const expiresAt = createdAt + Number.parseInt(ms(user.confirmWithin));
    return now > expiresAt;
  }
  /**
   * Generate code.
   */
  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    // Set code to random string of length 32 (2 per hex i.e. 16 bytes)
    const buffer = await crypto.randomBytes(16);
    this.code = buffer.toString("hex");
  }
};
