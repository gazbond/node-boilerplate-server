const Knex = require("knex");
/**
 * @param {Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable("rbac_role", function(table) {
    table
      .string("name", 64)
      .primary()
      .notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
  await knex.schema.createTable("rbac_permission", function(table) {
    table
      .string("name", 64)
      .primary()
      .notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
  await knex.schema.createTable("rbac_permission_assignment", function(table) {
    table.string("permission_name", 64).notNullable();
    table.string("role_name", 64).notNullable();
    table.primary(["role_name", "permission_name"]);
    table.foreign("role_name").references("rbac_role.name");
    table.foreign("permission_name").references("rbac_permission.name");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
  await knex.schema.createTable("rbac_role_assignment", function(table) {
    table.string("role_name", 64).notNullable();
    table
      .integer("user_id")
      .unsigned()
      .notNullable();
    table.primary(["role_name", "user_id"]);
    table.foreign("role_name").references("rbac_role.name");
    table.foreign("user_id").references("user_identity.id");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("rbac_role_assignment");
  await knex.schema.dropTable("rbac_permission_assignment");
  await knex.schema.dropTable("rbac_permission");
  await knex.schema.dropTable("rbac_role");
};
