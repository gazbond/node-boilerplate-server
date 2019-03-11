const environment = process.env.ENVIRONMENT || "testing";
const config = require("../knexfile")[environment];
const knex = require("knex")(config);
const { Model } = require("objection");
Model.knex(knex);
module.exports = knex;
