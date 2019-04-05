/// <reference path="../../library/typings/steps.d.ts" />
const { knex } = require("../../config");

BeforeSuite(async () => {
  await knex.migrate.latest();
});
Before(async () => {
  await knex.seed.run({
    directory: "./seeds/test"
  });
});

Feature("Test SecurityController");

Scenario("test submitting empty login form", I => {
  I.amOnPage("/security/login");
  I.fillField("login", "");
  I.fillField("password", "");
  I.click("Login");
  I.see("Invalid Login, should be alpha-numeric.");
  I.see("Invalid Password, should be alpha-numeric.");
});

Scenario("test submitting wrong login form details", I => {
  I.amOnPage("/security/login");
  I.fillField("login", "1234");
  I.fillField("password", "1234");
  I.click("Login");
  I.see("Incorrect login");
  I.amOnPage("/security/login");
  I.fillField("login", "root");
  I.fillField("password", "1234");
  I.click("Login");
  I.see("Incorrect password");
});

Scenario("test submitting correct login form details", I => {
  I.amOnPage("/security/login");
  I.fillField("login", "root");
  I.fillField("password", "password");
  I.click("Login");
  I.seeCookie("Authorization");
});

/**
 * Destroy knex instance so that codecept process exists.
 * Must be last to prevent codecept bug.
 */
AfterSuite(async () => {
  await knex.destroy();
});
