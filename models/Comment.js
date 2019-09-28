const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");

module.exports = class Comment extends BaseModel {
  static get tableName() {
    return "app_comment";
  }
  static get idColumn() {
    return "id";
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: ["user_id", "campaign_id", "text"],
      properties: {
        id: { type: "integer" },
        user_id: { type: "integer" },
        campaign_id: { type: "integer" },
        status: {
          type: "string",
          enum: ["visible", "hidden", "deleted"]
        },
        text: { type: "string" }
      }
    };
  }
  static get relationMappings() {
    return {
      user: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: "app_comment.user_id",
          to: "user_identity.id"
        }
      }
    };
  }
};
