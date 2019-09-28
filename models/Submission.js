const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");
const Media = require("./Media");

module.exports = class Submission extends BaseModel {
  static get tableName() {
    return "app_submission";
  }
  static get idColumn() {
    return "id";
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: ["submitter_id", "track_id"],
      properties: {
        id: { type: "integer" },
        submitter_id: { type: "integer" },
        track_id: { type: "integer" },
        status: {
          type: "string",
          enum: ["visible", "hidden", "deleted"]
        },
        title: { type: "string", maxLength: 255 },
        artwork_id: { type: "integer" },
        thumb_id: { type: "integer" }
      }
    };
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
