const { Model } = require("objection");

module.exports = class User extends Model {
  constructor() {
    super();
    this.username = null;
    this.email = null;
  }
  static get tableName() {
    return "users";
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
        username: { type: "string", minLength: 1, maxLength: 255 },
        email: { type: "string", minLength: 1, maxLength: 255 }
      }
    };
  }
};
