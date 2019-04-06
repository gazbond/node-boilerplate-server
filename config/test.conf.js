/**
 * ------------------------------------------------------
 * Config.
 * ------------------------------------------------------
 */
const config = require("../knexfile")["testing"];
const knex = require("knex")(config);
// Provide connection to models.
const { Model } = require("objection");
Model.knex(knex);

module.exports = {
  name: "Node boilerplate test server",
  baseUrl: "http://nodetest:7070",
  knex: knex,
  jwt: {
    secretOrKey: "md6a-gbs89le72ha8we7js-zo-awns67uw",
    expiresIn: "2 days"
  },
  email: {
    from: "no-reply@node-boilerplate-server.com",
    transport: {
      // Writes to file: tests/_output/emails/ instead of sending
      jsonTransport: true
    }
  },
  models: {
    user: {
      emailConfirmation: true,
      roles: ["user"],
      confirmWithin: "1 week",
      recoverWithin: "1 day"
    }
  }
};
