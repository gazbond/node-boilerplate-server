const { Model } = require("objection");
const BaseModel = require("../library/BaseModel");
const User = require("./User");
const Credit = require("./Credit");
const Campaign = require("./Campaign");

module.exports = class Debit extends BaseModel {
  static get tableName() {
    return "app_debit";
  }
  static get idColumn() {
    return "id";
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: ["reviewer_id", "credit_id", "numb_spent"],
      properties: {
        id: { type: "integer" },
        reviewer_id: { type: "integer" },
        credit_id: { type: "integer" },
        status: {
          type: "string",
          enum: ["pending", "paid", "refund"]
        },
        numb_spent: { type: "integer" }
      }
    };
  }
  static get relationMappings() {
    return {
      reviewer: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: "app_debit.reviewer_id",
          to: "user_identity.id"
        }
      },
      credit: {
        relation: Model.BelongsToOneRelation,
        modelClass: Credit,
        join: {
          from: "app_debit.credit_id",
          to: "app_credit.id"
        }
      }
    };
  }
};
