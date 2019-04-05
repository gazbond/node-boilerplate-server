/// <reference path="../../library/typings/steps.d.ts" />
const path = require("path");
const fs = require("fs");
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

Scenario("test forgot password link on login form", I => {
  I.amOnPage("/security/login");
  I.click("Forgot Password?");
  I.see("Recover Password");
});

Scenario("test resend confirmation link on login form", I => {
  I.amOnPage("/security/login");
  I.click("Resend Confirmation Email");
  I.see("Confirm Email");
});

Scenario("test submitting wrong forgot password form details", I => {
  I.amOnPage("/security/recover");
  I.fillField("email", "");
  I.click("Submit");
  I.see("Invalid email address.");
  I.amOnPage("/security/recover");
  I.fillField("email", "wrong@email.com");
  I.click("Submit");
  I.see("Email not found.");
});

Scenario("test submitting correct forgot password form details", I => {
  I.amOnPage("/security/recover");
  I.fillField("email", "dev@gazbond.co.uk");
  I.click("Submit");
  I.see("Email Sent");
});

Scenario("test submitting wrong resend confirmation form details", I => {
  I.amOnPage("/security/resend");
  I.fillField("email", "");
  I.click("Send");
  I.see("Invalid email address.");
  I.amOnPage("/security/resend");
  I.fillField("email", "wrong@email.com");
  I.click("Send");
  I.see("Email not found.");
});

Scenario("test submitting correct resend confirmation form details", I => {
  I.amOnPage("/security/resend");
  I.fillField("email", "dev@gazbond.co.uk");
  I.click("Send");
  I.see("Email Sent");
});

const loadEmail = async emailPath => {
  const file = JSON.parse(
    await fs.readFileSync(
      path.resolve(__dirname, "../_output/emails/" + emailPath),
      "utf8"
    )
  );
  return file;
};

const extractLink = text => {
  const link = text.match(/(http?:\/\/[^\s]+)/g).toString();
  return link.replace("http://nodetest:7070", "");
};

Scenario("test following forgot password email link", async I => {
  I.amOnPage("/security/recover");
  I.fillField("email", "dev@gazbond.co.uk");
  await I.click("Submit");
  const email = await loadEmail("recovery/dev@gazbond.co.uk.json");
  const link = extractLink(email.text);
  I.amOnPage(link);
  I.fillField("password", "");
  I.fillField("confirm_password", "");
  I.click("Submit");
  I.see("Invalid Password, should be alpha-numeric.");
  I.see("Invalid confirm password, should be alpha-numeric.");
  I.fillField("password", "newPassword");
  I.fillField("confirm_password", "newPassword");
  I.click("Submit");
  I.see("Password Changed");
});

Scenario("test following resend confirmation email link", async I => {
  I.amOnPage("/security/resend");
  I.fillField("email", "dev@gazbond.co.uk");
  await I.click("Send");
  const email = await loadEmail("confirmation/dev@gazbond.co.uk.json");
  const link = extractLink(email.text);
  I.amOnPage(link);
  I.see("Email Confirmed");
});

/**
 * Destroy knex instance so that codecept process exists.
 * Must be last to prevent codecept bug.
 */
AfterSuite(async () => {
  await knex.destroy();
});
