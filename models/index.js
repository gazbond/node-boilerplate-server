const User = require("./User");

module.exports = function(knex) {
  return {
    // @ts-ignore
    User: User.bindKnex(knex)
  };
};
