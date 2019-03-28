const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");
const BaseClass = DbErrors(Model);

const crypto = require("crypto-promise");
const User = require("./User");

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
   * @param {number} user_id
   * @param {string} code
   * @param {number} type
   */
  static searchTokens(user_id, code, type = undefined) {
    const where = { user_id: user_id, code: code };
    if (type) {
      where.type = type;
    }
    return this.query().where(where);
  }
  /**
   * Generate auth key.
   */
  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    // Set code to random string of length 32 (2 per hex i.e. 16 bytes)
    const buffer = await crypto.randomBytes(16);
    this.code = buffer.toString("hex");
  }
};
