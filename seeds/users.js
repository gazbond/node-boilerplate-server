exports.seed = async function(knex) {
  const db = require("../models")(knex);
  await knex("user_identity").del();
  await db.User.query().insert({
    username: "root",
    email: "dev@gazbond.co.uk",
    password_hash: "password"
  });
  await db.User.query().insert({
    username: "gazbond",
    email: "gaz@gazbond.co.uk",
    password_hash: "password"
  });
};
