const expect = require("expect.js");
const objection = require("objection");
const knex = require("../knex");
const db = require("../../models")(knex);

before(async function() {
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
        expect(error.data.username).to.eql([
          {
            message: "should NOT be shorter than 1 characters",
            keyword: "minLength",
            params: { limit: 1 }
          }
        ]);
        expect(error.data).to.have.property("email");
        expect(error.data.email).to.eql([
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
  it("tests User creates timestamps and hashes password on insert and update", async function() {
    // Test insert
    const insertUser = await db.User.query()
      .insert({
        id: 3,
        username: "gaz",
        email: "test@gazbond.co.uk",
        password_hash: "password"
      })
      // Postgres 'trick' to fetch inserted row
      .returning("*");
    expect(insertUser.password_hash).to.be.a("string");
    expect(insertUser.created_at).to.be.a(Date);
    expect(insertUser.updated_at).to.be.a(Date);
    // Test update (patch)
    const password_hash = insertUser.password_hash;
    const updated_at = insertUser.updated_at;
    const updateUser = await db.User.query().patchAndFetchById(insertUser.id, {
      username: "gazb"
    });
    expect(insertUser.password_hash).to.equal(password_hash);
    expect(insertUser.updated_at).to.be.a(Date);
    expect(updateUser.updated_at).to.not.equal(new Date(updated_at));
  });
});
