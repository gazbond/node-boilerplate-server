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
        password_hash: { type: "string", minLength: 0, maxLength: 60 }
      }
    };
  }
};
