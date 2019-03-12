/// <reference path="../../typings/steps.d.ts" />

Feature("Test SecurityController");

Scenario("test submitting empty login form", I => {
  I.amOnPage("/security/login");
  I.fillField("login", "");
  I.fillField("password", "");
  I.click("Login");
  I.see("Login should be alpha-numeric and more than 3 characters long");
  I.see("Password should be alpha-numeric and more than 4 characters long");
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
