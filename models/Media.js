const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");

module.exports = class Media extends BaseModel {
  static get tableName() {
    return "app_media";
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
          from: "app_media.user_id",
          to: "user_identity.id"
        }
      }
    };
  }
};