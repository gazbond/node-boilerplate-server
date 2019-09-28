const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");

module.exports = class Review extends BaseModel {
  static get tableName() {
    return "app_review";
  }
  static get idColumn() {
    return "id";
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: ["reviewer_id", "campaign_id", "score"],
      properties: {
        id: { type: "integer" },
        reviewer_id: { type: "integer" },
        campaign_id: { type: "integer" },
        status: {
          type: "string",
          enum: ["visible", "hidden", "completed", "deleted"]
        },
        score: { type: "integer" }
      }
    };
  }
  static get relationMappings() {
    return {
      reviewer: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: "app_review.reviewer_id",
          to: "user_identity.id"
        }
      }
    };
  }
};
