import User from "./User";

let models = null;

export default function(knex) {
  if (!models) {
    models = {
      User: User.bindKnex(knex)
    };
  }
  return models;
}
