exports.up = async function(knex) {
  await knex.schema.createTable("users", function(table) {
    table.increments();
    table.string("username", 25);
    table.string("email", 255);
    table.string("password_hash", 60);
    table.string("auth_key", 32);
    table.timestamps();
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("users");
};
