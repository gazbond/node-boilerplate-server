const expect = require("expect.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
chai.use(chaiHttp);

const objection = require("objection");
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

describe("Initial tests", function() {
  it("tests User.username=root loads from database", async function() {
    // @ts-ignore
    const user = await User.query()
      .where({
        username: "root"
      })
      .first();
    expect(user.email).to.be("dev@gazbond.co.uk");
  });
  it("tests User fails validation", async function() {
    try {
      // @ts-ignore
      const user = await User.query().insert({
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
    // @ts-ignore
    const insertUser = await User.query()
      .insert({
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
    // @ts-ignore
    const updateUser = await User.query().patchAndFetchById(insertUser.id, {
      username: "gazb"
    });
    expect(insertUser.password_hash).to.equal(password_hash);
    expect(insertUser.updated_at).to.be.a(Date);
    expect(updateUser.updated_at).to.not.equal(new Date(updated_at));
  });
});
