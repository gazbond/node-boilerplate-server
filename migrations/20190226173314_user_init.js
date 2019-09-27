const Knex = require("knex");
/**
 * @param {Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable("user_identity", function(table) {
    table
      .increments()
      .unsigned()
      .notNullable();
    table
      // @ts-ignore
      .enu("status", ["unconfirmed", "active", "suspended", "deleted"], {
        useNative: true,
        enumName: "user_identity_status"
      })
      .notNullable()
      .defaultTo("unconfirmed");
    table.string("username", 25).notNullable();
    table.string("email", 255).notNullable();
    table.string("password", 60);
    table.string("auth_key", 32).notNullable();
    table.timestamp("confirmed_at");
    table.timestamps();
  });
  await knex.schema.createTable("user_token", function(table) {
    table
      .integer("user_id")
      .unsigned()
      .notNullable();
    table.integer("type").notNullable();
    table.string("code", 32).notNullable();
    table.primary(["type", "user_id", "code"]);
    table.foreign("user_id").references("user_identity.id");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("user_token");
  await knex.schema.dropTable("user_identity");
};
