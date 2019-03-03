/// <reference path="../../typings/steps.d.ts" />

Feature("Initial tests");

Scenario("test user login route is present", I => {
  I.amOnPage("/user/login");
  I.see("Nothing here yet :(");
});

Scenario("test user api route is present", I => {
  I.sendGetRequest("/users");
  I.saveScreenshot("screenshot.png");
});
