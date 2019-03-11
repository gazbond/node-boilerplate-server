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
    table.string("username", 25).notNullable();
    table.string("email", 255).notNullable();
    table.string("password_hash", 60);
    table.string("auth_key", 32);
    table.timestamps();
  });
  await knex.schema.createTable("user_profile", function(table) {
    table
      .increments()
      .unsigned()
      .notNullable();
    table.string("phone", 25);
    table.string("bio", 255);
    table.integer("user_id").notNullable();
    table.timestamps();
    table.foreign("user_id").references("user_identity.id");
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("user_profile");
  await knex.schema.dropTable("user_identity");
};
