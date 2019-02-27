/// <reference path="../../typings/steps.d.ts" />

Feature("testing");

Scenario("test something", I => {
  I.amOnPage("http://google.co.uk");
  I.see("Google");
});
