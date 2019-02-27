const BaseModel = require("./BaseModel");

module.exports = class User extends BaseModel {
  constructor() {
    super();
    this.username = null;
    this.email = null;
  }
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
        email: { type: "string", format: "email" }
      }
    };
  }
};
