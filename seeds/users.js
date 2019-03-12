exports.seed = async function(knex) {
  const { Model } = require("objection");
  Model.knex(knex);
  const User = require("../models/User");
  await knex("user_identity").del();
  // @ts-ignore
  await User.query().insert({
    username: "root",
    email: "dev@gazbond.co.uk",
    password_hash: "password"
  });
  // @ts-ignore
  await User.query().insert({
    username: "gazbond",
    email: "gaz@gazbond.co.uk",
    password_hash: "password"
  });
};
