const User = require("./User");

module.exports = function(knex) {
  return {
    User: User.bindKnex(knex)
  };
};
