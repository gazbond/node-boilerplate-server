const crypto = require("crypto-promise");
const BaseModel = require("./BaseModel");
const Password = require("objection-password")({
  passwordField: "password_hash"
});

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
  $beforeInsert(queryContext) {
    const maybePromise = super.$beforeInsert(queryContext);
    return Promise.resolve(maybePromise).then(async () => {
      // Set auth key to random string of length 32 (2 per hex i.e. 16 bytes)
      const buffer = await crypto.randomBytes(16);
      this.auth_key = buffer.toString("hex");
    });
  }
};
