const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");

module.exports = class Media extends BaseModel {
  static get tableName() {
    return "app_media";
  }
  static get idColumn() {
    return "id";
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: ["user_id", "url"],
      properties: {
        id: { type: "integer" },
        user_id: { type: "integer" },
        status: {
          type: "string",
          enum: ["visible", "hidden", "deleted"]
        },
        type: {
          type: "string",
          enum: ["audio", "image"]
        },
        url: { type: "string", maxLength: 255, format: "url" },
        mime: { type: "string", maxLength: 32 },
        hover_text: { type: "string", maxLength: 32 }
      }
    };
  }
  static get relationMappings() {
    return {
      user: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: "app_media.user_id",
          to: "user_identity.id"
        }
      }
    };
  }
};
