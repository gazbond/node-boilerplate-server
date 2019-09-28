const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");

module.exports = class Request extends BaseModel {
  static get tableName() {
    return "app_request";
  }
  static get idColumn() {
    return ["id"];
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: ["reviewer_id", "campaign_id", "credits"],
      properties: {
        id: { type: "integer" },
        reviewer_id: { type: "integer" },
        campaign_id: { type: "integer" },
        status: {
          type: "string",
          enum: ["visible", "hidden", "completed", "deleted"]
        },
        credits: { type: "integer" }
      }
    };
  }
  static get relationMappings() {
    return {
      reviewer: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: "app_request.reviewer_id",
          to: "user_identity.id"
        }
      }
    };
  }
};
