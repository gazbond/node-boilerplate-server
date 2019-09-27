const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");
const Campaign = require("./Campaign");

module.exports = class Credit extends BaseModel {
  static get tableName() {
    return "app_credit";
  }
  static get idColumn() {
    return "id";
  }
  static get jsonSchema() {
    return {};
  }
  static get relationMappings() {
    return {
      submitter: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: "app_credit.submitter_id",
          to: "user_identity.id"
        }
      },
      campaign: {
        relation: Model.BelongsToOneRelation,
        modelClass: Campaign,
        join: {
          from: "app_credit.campaign_id",
          to: "app_campaign.id"
        }
      }
    };
  }
};
