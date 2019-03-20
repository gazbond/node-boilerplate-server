/**
 * ------------------------------------------------------
 * Config.
 * ------------------------------------------------------
 */
const environment = process.env.ENVIRONMENT || "development";
const config = require("../knexfile")[environment];
const knex = require("knex")(config);
// Provide connection to models.
const { Model } = require("objection");
Model.knex(knex);

module.exports = {
  name: "Node boilerplate app",
  knex: knex,
  jwt: {
    secretOrKey: "md6a-gbs89le72ha8we7js-zo-awns67uw",
    expiresIn: "2 days"
  }
};