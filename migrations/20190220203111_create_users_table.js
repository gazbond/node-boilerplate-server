export function up(knex) {
  return knex.schema.createTable("users", function(table) {
    table.increments();
    table.string("name");
    table.string("email");
    table.timestamps();
  });
}
export function down(knex) {
  return knex.schema.dropTable("users");
}
