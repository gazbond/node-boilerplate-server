exports.up = async function(knex) {
  await knex.schema.createTable("rbac_rule", function(table) {
    table.string("name", 64).primary();
    table.binary("data");
    table.timestamps();
  });
  await knex.schema.createTable("rbac_item", function(table) {
    table.string("name", 64).primary();
    table.text("description");
    table.string("rule_name", 64);
    table.binary("data");
    table.timestamps();
  });
  await knex.schema.createTable("rbac_item_child", function(table) {
    table.string("parent", 64);
    table.string("child", 64);
  });
  await knex.schema.createTable("rbac_assignment", function(table) {
    table.string("item_name");
    table.string("user_id");
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("rbac_rule");
  await knex.schema.dropTable("rbac_item");
  await knex.schema.dropTable("rbac_item_child");
  await knex.schema.dropTable("rbac_assignment");
};
