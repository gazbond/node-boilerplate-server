exports.seed = async function(knex) {
  await knex("users").del();
  await knex("users").insert([
    {
      id: 1,
      username: "root",
      email: "dev@gazbond.co.uk"
    },
    {
      id: 2,
      username: "gazbond",
      email: "gaz@gazbond.co.uk"
    }
  ]);
};
