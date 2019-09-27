const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");
const Campaign = require("./Campaign");

module.exports = class Comment extends BaseModel {
  static get tableName() {
    return "app_comment";
  }
  static get idColumn() {
    return "id";
  }
  static get jsonSchema() {
    return {};
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
      },
      campaign: {
        relation: Model.HasOneRelation,
        modelClass: Campaign,
        join: {
          from: "app_comment.campaign_id",
          to: "app_campaign.id"
        }
      }
    };
  }
};