const environment = process.env.ENVIRONMENT || "testing";
const config = require("../knexfile")[environment];
module.exports = require("knex")(config);
