const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");
const Media = require("./Media");
const Submission = require("./Submission");
const Comment = require("./Comment");
const Request = require("./Request");
const Review = require("./Review");
const Credit = require("./Credit");

module.exports = class Campaign extends BaseModel {
  static get tableName() {
    return "app_campaign";
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
          from: "app_campaign.submitter_id",
          to: "user_identity.id"
        }
      },
      submission: {
        relation: Model.HasOneRelation,
        modelClass: Submission,
        join: {
          from: "app_campaign.submission_id",
          to: "app_submission.id"
        }
      },
      requests: {
        relation: Model.HasManyRelation,
        modelClass: Request,
        join: {
          from: "app_campaign.id",
          to: "app_request.campaign_id"
        }
      },
      reviews: {
        relation: Model.HasManyRelation,
        modelClass: Review,
        join: {
          from: "app_campaign.id",
          to: "app_review.campaign_id"
        }
      },
      comments: {
        relation: Model.HasManyRelation,
        modelClass: Comment,
        join: {
          from: "app_comment.campaign_id",
          to: "app_campaign.id"
        }
      },
      credits: {
        relation: Model.HasManyRelation,
        modelClass: Credit,
        join: {
          from: "app_comment.campaign_id",
          to: "app_campaign.id"
        }
      },
      artwork: {
        relation: Model.HasOneRelation,
        modelClass: Media,
        join: {
          from: "app_campaign.artwork_id",
          to: "app_media.id"
        }
      },
      thumb: {
        relation: Model.HasOneRelation,
        modelClass: Media,
        join: {
          from: "app_campaign.thumb_id",
          to: "app_media.id"
        }
      }
    };
  }
};
