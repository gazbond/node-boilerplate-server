const expect = require("expect.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const { ValidationError } = require("objection");
const knex = require("../knex");
const User = require("../../models/User");

before(async function() {
  await knex.migrate.latest();
});
beforeEach(async function() {
  await knex.seed.run();
});
after(async function() {
  await knex.destroy();
});

describe("Test User model", function() {
  it("tests User username=root loads", async function() {
    const user = await User.query()
      .where({
        username: "root"
      })
      .first();
    expect(user.email).to.be("dev@gazbond.co.uk");
  });
  it("tests User fails validation", async function() {
    try {
      const user = await User.query().insert({
        username: "",
        email: "not-an-email"
      });
    } catch (error) {
      if (error instanceof ValidationError) {
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
  it("tests User creates timestamps and hashes on insert and update", async function() {
    // Test insert
    const insertUser = await User.query()
      .insert({
        username: "gaz",
        email: "test@gazbond.co.uk",
        password_hash: "password"
      })
      // Postgres 'trick' to fetch inserted row
      .returning("*");
    expect(insertUser.password_hash).to.be.a("string");
    expect(insertUser.password_hash).to.not.eql("password");
    expect(insertUser.auth_key).to.be.a("string");
    expect(insertUser.created_at).to.be.a(Date);
    expect(insertUser.updated_at).to.be.a(Date);
    // Test update (patch)
    const updateUser = await User.query().patchAndFetchById(insertUser.id, {
      username: "gazb"
    });
    expect(updateUser.password_hash).to.eql(insertUser.password_hash);
    expect(updateUser.auth_key).to.eql(insertUser.auth_key);
    expect(updateUser.updated_at).to.be.a(Date);
    expect(updateUser.created_at).to.eql(insertUser.created_at);
    expect(updateUser.updated_at).to.not.eql(insertUser.updated_at);
  });
});
