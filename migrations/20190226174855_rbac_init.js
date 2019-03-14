exports.up = async function(knex) {
  await knex.schema.createTable("rbac_role", function(table) {
    table
      .string("name", 64)
      .primary()
      .notNull();
  });
  await knex.schema.createTable("rbac_permission", function(table) {
    table
      .string("name", 64)
      .primary()
      .notNull();
  });
  await knex.schema.createTable("rbac_permission_assignment", function(table) {
    table.string("permission_name", 64).notNull();
    table.string("role_name", 64).notNull();
    table.primary(["role_name", "permission_name"]);
    table.foreign("role_name").references("rbac_role.name");
    table.foreign("permission_name").references("rbac_permission.name");
  });
  await knex.schema.createTable("rbac_role_assignment", function(table) {
    table.string("role_name", 64).notNull();
    table.integer("user_id").notNull();
    table.primary(["role_name", "user_id"]);
    table.foreign("role_name").references("rbac_role.name");
    table.foreign("user_id").references("user_identity.id");
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("rbac_role_assignment");
  await knex.schema.dropTable("rbac_permission_assignment");
  await knex.schema.dropTable("rbac_permission");
  await knex.schema.dropTable("rbac_role");
};
