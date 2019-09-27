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
    table
      // @ts-ignore
      .enu("type", ["audio", "image"], {
        useNative: true,
        enumName: "app_media_type"
      })
      .notNullable()
      .defaultTo("image");
    table.string("mime", 32);
    table.string("hover_text", 32);
    table.timestamps();
  });
  await knex.schema.createTable("app_profile", function(table) {
    table
      .increments()
      .unsigned()
      .notNullable();
    table
      // @ts-ignore
      .enu("status", ["visible", "hidden", "deleted"], {
        useNative: true,
        enumName: "app_profile_status"
      })
      .notNullable()
      .defaultTo("visible");
    table
      .integer("user_id")
      .unsigned()
      .notNullable();
    table.foreign("user_id").references("user_identity.id");
    table.string("phone", 32);
    table.string("bio", 255);
    table.string("tags", 255);
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
    table.integer("artwork_id").unsigned();
    table.foreign("artwork_id").references("app_media.id");
    table.integer("thumb_id").unsigned();
    table.foreign("thumb_id").references("app_media.id");
    table.timestamps();
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
    table
      .integer("submission_id")
      .unsigned()
      .notNullable();
    table.foreign("submission_id").references("app_submission.id");
    table.timestamp("starts_at");
    table.timestamp("ends_at");
    table.integer("duration").notNullable();
    table.string("tags", 255);
    table.text("description");
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
      .integer("campaign_id")
      .unsigned()
      .notNullable();
    table.foreign("campaign_id").references("app_campaign.id");
    table.integer("score").notNullable();
    table.timestamps();
  });
  await knex.schema.createTable("app_request", function(table) {
    table
      .increments()
      .unsigned()
      .notNullable();
    table
      .integer("campaign_id")
      .unsigned()
      .notNullable();
    table.foreign("campaign_id").references("app_campaign.id");
    table
      .integer("reviewer_id")
      .unsigned()
      .notNullable();
    table.foreign("reviewer_id").references("user_identity.id");
    table
      // @ts-ignore
      .enu("status", ["visible", "hidden", "completed", "deleted"], {
        useNative: true,
        enumName: "app_request_status"
      })
      .notNullable()
      .defaultTo("visible");
    table.integer("credits").notNullable();
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
      .integer("campaign_id")
      .unsigned()
      .notNullable();
    table.foreign("campaign_id").references("app_campaign.id");
    table.text("text").notNullable();
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
    table.string("charge_id", 255).notNullable();
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
      .enu("status", ["pending", "paid", "refund"], {
        useNative: true,
        enumName: "app_debit_status"
      })
      .notNullable()
      .defaultTo("pending");
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
  await knex.schema.dropTable("app_request");
  await knex.schema.dropTable("app_review");
  await knex.schema.dropTable("app_campaign");
  await knex.schema.dropTable("app_submission");
  await knex.schema.dropTable("app_profile");
  await knex.schema.dropTable("app_media");
};
