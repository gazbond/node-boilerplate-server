const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");
const Media = require("./Media");
const Campaign = require("./Campaign");

module.exports = class Submission extends BaseModel {
  static get tableName() {
    return "app_submission";
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
          from: "app_submission.submitter_id",
          to: "user_identity.id"
        }
      },
      track: {
        relation: Model.HasOneRelation,
        modelClass: Media,
        join: {
          from: "app_submission.track_id",
          to: "app_media.id"
        }
      },
      artwork: {
        relation: Model.HasOneRelation,
        modelClass: Media,
        join: {
          from: "app_submission.artwork_id",
          to: "app_media.id"
        }
      },
      thumb: {
        relation: Model.HasOneRelation,
        modelClass: Media,
        join: {
          from: "app_submission.thumb_id",
          to: "app_media.id"
        }
      }
    };
  }
};
