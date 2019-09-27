const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");
const Media = require("./Media");
const Campaign = require("./Campaign");

module.exports = class Review extends BaseModel {
  static get tableName() {
    return "app_review";
  }
  static get idColumn() {
    return "id";
  }
  static get jsonSchema() {
    return {};
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
      },
      campaign: {
        relation: Model.HasOneRelation,
        modelClass: Campaign,
        join: {
          from: "app_review.campaign_id",
          to: "app_campaign.id"
        }
      }
    };
  }
};