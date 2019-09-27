const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");
const Campaign = require("./Campaign");

module.exports = class Request extends BaseModel {
  static get tableName() {
    return "app_request";
  }
  static get idColumn() {
    return ["campaign_id", "review_id"];
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
          from: "app_request.reviewer_id",
          to: "user_identity.id"
        }
      },
      campaign: {
        relation: Model.HasOneRelation,
        modelClass: Campaign,
        join: {
          from: "app_request.campaign_id",
          to: "app_campaign.id"
        }
      }
    };
  }
};
