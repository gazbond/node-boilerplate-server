const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");
const Media = require("./Media");

module.exports = class Profile extends BaseModel {
  static get tableName() {
    return "app_profile";
  }
  static get idColumn() {
    return "id";
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: ["user_id"],
      properties: {
        id: { type: "integer" },
        user_id: { type: "integer" },
        status: {
          type: "string",
          enum: ["visible", "hidden", "deleted"]
        },
        phone: { type: "string", maxLength: 32 },
        bio: { type: "string", maxLength: 255 },
        tags: { type: "string", maxLength: 255 },
        artwork_id: { type: "integer" },
        thumb_id: { type: "integer" }
      }
    };
  }
  static get relationMappings() {
    return {
      user: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: "app_profile.user_id",
          to: "user_identity.id"
        }
      },
      artwork: {
        relation: Model.HasOneRelation,
        modelClass: Media,
        join: {
          from: "app_profile.artwork_id",
          to: "app_media.id"
        }
      },
      thumb: {
        relation: Model.HasOneRelation,
        modelClass: Media,
        join: {
          from: "app_profile.thumb_id",
          to: "app_media.id"
        }
      }
    };
  }
};
