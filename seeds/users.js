export function seed(knex) {
  return knex("users")
    .del()
    .then(function() {
      return knex("users").insert([
        {
          id: 1,
          name: "root",
          email: "dev@gazbond.co.uk"
        },
        {
          id: 2,
          name: "gazbond",
          email: "gaz@gazbond.co.uk"
        }
      ]);
    });
}
