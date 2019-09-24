const Knex = require("knex");
/**
 * @param {Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable("app_media", function(table) {
    table
      .increments()
      .unsigned()
      .notNullable();
    table
      // @ts-ignore
      .enu("status", ["visible", "hidden", "deleted"], {
        useNative: true,
        enumName: "app_media_status"
      })
      .notNullable()
      .defaultTo("visible");
    table
      .integer("user_id")
      .unsigned()
      .notNullable();
    table.foreign("user_id").references("user_identity.id");
    table.string("url", 255).notNullable();
    table.enu("type", ["audio", "image"]);
    table.string("mime", 32);
    table.string("hover_text", 32);
    table.timestamps();
  });
  await knex.schema.alterTable("user_profile", function(table) {
    table.integer("artwork_id").unsigned();
    table.foreign("artwork_id").references("app_media.id");
    table.integer("thumb_id").unsigned();
    table.foreign("thumb_id").references("app_media.id");
    table.string("tags", 255);
  });
  await knex.schema.createTable("app_campaign", function(table) {
    table
      .increments()
      .unsigned()
      .notNullable();
    table
      .enu(
        "status",
        ["draft", "submitted", "cancelled", "completed", "deleted"],
        // @ts-ignore
        {
          useNative: true,
          enumName: "app_campaign_status"
        }
      )
      .notNullable()
      .defaultTo("draft");
    table
      .integer("submitter_id")
      .unsigned()
      .notNullable();
    table.foreign("submitter_id").references("user_identity.id");
    table.timestamp("starts_at");
    table.timestamp("ends_at");
    table.string("duration", 32);
    table.string("tags", 255);
    table.text("description");
    table.integer("artwork_id").unsigned();
    table.foreign("artwork_id").references("app_media.id");
    table.integer("thumb_id").unsigned();
    table.foreign("thumb_id").references("app_media.id");
    table.timestamps();
  });
  await knex.schema.createTable("app_submission", function(table) {
    table
      .increments()
      .unsigned()
      .notNullable();
    table
      // @ts-ignore
      .enu("status", ["visible", "hidden", "deleted"], {
        useNative: true,
        enumName: "app_submission_status"
      })
      .notNullable()
      .defaultTo("visible");
    table
      .integer("submitter_id")
      .unsigned()
      .notNullable();
    table.foreign("submitter_id").references("user_identity.id");
    table
      .integer("track_id")
      .unsigned()
      .notNullable();
    table.foreign("track_id").references("app_media.id");
    table.string("title", 255);
    table.integer("campaign_id").unsigned();
    table.foreign("campaign_id").references("app_campaign.id");
    table.integer("artwork_id").unsigned();
    table.foreign("artwork_id").references("app_media.id");
    table.integer("thumb_id").unsigned();
    table.foreign("thumb_id").references("app_media.id");
    table.timestamps();
  });
  await knex.schema.createTable("app_review", function(table) {
    table
      .increments()
      .unsigned()
      .notNullable();
    table
      // @ts-ignore
      .enu("status", ["visible", "hidden", "deleted"], {
        useNative: true,
        enumName: "app_review_status"
      })
      .notNullable()
      .defaultTo("visible");
    table
      .integer("reviewer_id")
      .unsigned()
      .notNullable();
    table.foreign("reviewer_id").references("user_identity.id");
    table
      .integer("submission_id")
      .unsigned()
      .notNullable();
    table.foreign("submission_id").references("app_submission.id");
    table.integer("score");
    table.timestamps();
  });
  await knex.schema.createTable("app_comment", function(table) {
    table
      .increments()
      .unsigned()
      .notNullable();
    table
      // @ts-ignore
      .enu("status", ["visible", "hidden", "deleted"], {
        useNative: true,
        enumName: "app_comment_status"
      })
      .notNullable()
      .defaultTo("visible");
    table
      .integer("user_id")
      .unsigned()
      .notNullable();
    table.foreign("user_id").references("user_identity.id");
    table
      .integer("review_id")
      .unsigned()
      .notNullable();
    table.foreign("review_id").references("app_review.id");
    table.text("text");
    table.timestamps();
  });
  await knex.schema.createTable("app_credit", function(table) {
    table
      .increments()
      .unsigned()
      .notNullable();
    table
      // @ts-ignore
      .enu("status", ["paid", "refund"], {
        useNative: true,
        enumName: "app_credit_status"
      })
      .notNullable()
      .defaultTo("paid");
    table
      .integer("submitter_id")
      .unsigned()
      .notNullable();
    table.foreign("submitter_id").references("user_identity.id");
    table.integer("campaign_id").unsigned();
    table.foreign("campaign_id").references("app_campaign.id");
    table.string("charge_id", 255);
    table.decimal("price", 19, 4);
    table.decimal("fee", 19, 4);
    table.string("currency", 32);
    table.integer("numb_bought").notNullable();
    table.integer("numb_spent").notNullable();
    table.timestamps();
  });
  await knex.schema.createTable("app_debit", function(table) {
    table
      .increments()
      .unsigned()
      .notNullable();
    table
      // @ts-ignore
      .enu("status", ["paid", "refund"], {
        useNative: true,
        enumName: "app_debit_status"
      })
      .notNullable()
      .defaultTo("paid");
    table
      .integer("reviewer_id")
      .unsigned()
      .notNullable();
    table.foreign("reviewer_id").references("user_identity.id");
    table
      .integer("credit_id")
      .unsigned()
      .notNullable();
    table.foreign("credit_id").references("app_credit.id");
    table.integer("numb_spent").notNullable();
    table.timestamps();
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("app_debit");
  await knex.schema.dropTable("app_credit");
  await knex.schema.dropTable("app_comment");
  await knex.schema.dropTable("app_review");
  await knex.schema.dropTable("app_submission");
  await knex.schema.dropTable("app_campaign");
  await knex.schema.alterTable("user_profile", function(table) {
    table.dropForeign("artwork_id");
    table.dropColumn("artwork_id");
    table.dropForeign("thumb_id");
    table.dropColumn("thumb_id");
    table.dropColumn("tags");
  });
  await knex.schema.dropTable("app_media");
};
