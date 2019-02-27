const expect = require("expect.js");
const objection = require("objection");
const knex = require("../knex");
const db = require("../../models")(knex);

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
    expect(user.username).to.be("root");
  });
  it("tests User fails validation", async function() {
    try {
      const user = await db.User.query().insert({
        username: "",
        email: "not-an-email"
      });
    } catch (error) {
      if (error instanceof objection.ValidationError) {
        expect(error.data).to.have.property("username");
        expect(error.data.username).to.be.eql([
          {
            message: "should NOT be shorter than 1 characters",
            keyword: "minLength",
            params: { limit: 1 }
          }
        ]);
        expect(error.data).to.have.property("email");
        expect(error.data.email).to.be.eql([
          {
            message: 'should match format "email"',
            keyword: "format",
            params: { format: "email" }
          }
        ]);
      } else {
        console.log(error);
      }
    }
  });
});
