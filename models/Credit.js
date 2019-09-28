const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");

module.exports = class Credit extends BaseModel {
  static get tableName() {
    return "app_credit";
  }
  static get idColumn() {
    return "id";
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: [
        "submitter_id",
        "campaign_id",
        "charge_id",
        "numb_bought",
        "numb_spent"
      ],
      properties: {
        id: { type: "integer" },
        submitter_id: { type: "integer" },
        campaign_id: { type: "integer" },
        status: {
          type: "string",
          enum: ["paid", "refund"]
        },
        charge_id: { type: "string", maxLength: 255 },
        numb_bought: { type: "integer" },
        numb_spent: { type: "integer" }
      }
    };
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
      }
    };
  }
};
