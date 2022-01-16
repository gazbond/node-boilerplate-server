/**
 * ------------------------------------------------------
 * Config.
 * ------------------------------------------------------
 */
const config = require("../knexfile")["testing"];

// Relational Database.
const knex = require("knex")(config);

// Provide connection to models.
const { Model } = require("objection");
Model.knex(knex);

// ElasticSearch connection.
const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://elastic:elastic@elastictest:9200" });

module.exports = {
  name: "Node boilerplate test server",
  baseUrl: "http://nodetest:7070",
  knex: knex,
  elastic: client,
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
      roles: ["submitter"],
      confirmWithin: "1 week",
      recoverWithin: "1 day"
    }
  }
};
