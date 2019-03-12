/// <reference path="../../typings/steps.d.ts" />

Feature("Initial tests");

Scenario("test user login route is present", I => {
  I.amOnPage("/security/login");
  I.see("Login");
});

Scenario("test user api route is present", I => {
  I.sendGetRequest("/users");
});
