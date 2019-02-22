import expect from "expect.js";
import knex from "../knex";
import models from "../../models";
const db = models(knex);

before(async function() {
  await knex.migrate.rollback();
  await knex.migrate.latest();
});
beforeEach(async function() {
  await knex.seed.run();
});
after(async function() {
  await knex.destroy();
});

describe("Initial tests", function() {
  it("tests User.id=1 loads from database", async function() {
    const user = await db.User.query().findById(1);
    expect(user.name).to.be("root");
  });
});
