/// <reference path="../../typings/steps.d.ts" />

Feature("testing");

Scenario("test something", I => {
  I.amOnPage("/");
  I.see("Cannot GET /");
});
