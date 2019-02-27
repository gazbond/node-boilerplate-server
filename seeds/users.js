exports.seed = async function(knex) {
  await knex("user_identity").del();
  await knex("user_identity").insert([
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
