exports.seed = async function(knex) {
  const { Model } = require("objection");
  Model.knex(knex);

  await knex("app_debit").del();
  await knex("app_credit").del();
  await knex("app_comment").del();
  await knex("app_review").del();
  await knex("app_submission").del();
  await knex("app_campaign").del();
  await knex("app_media").del();
};
