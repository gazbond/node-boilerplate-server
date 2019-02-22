/// <reference path="../../typings/steps.d.ts" />

Feature("testing");

Scenario("test something", I => {
  I.amOnPage("http://localhost");
  I.see("OK");
});
