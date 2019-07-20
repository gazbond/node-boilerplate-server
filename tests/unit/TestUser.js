const expect = require("expect.js");
const { ValidationError } = require("objection");

const User = require("../../models/User");
const Token = require("../../models/Token");

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
      await User.query().insertAndFetch({
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
    const user = await User.query().insertAndFetch({
      username: "gaz",
      email: "test@gazbond.co.uk",
      password: "Password1"
    });
    expect(user.password).to.be.a("string");
    expect(user.password).to.not.eql("password");
    expect(user.auth_key).to.be.a("string");
    expect(user.created_at).to.be.a(Date);
    expect(user.updated_at).to.be.a(Date);
    const created_at = user.created_at;
    const updated_at = user.updated_at;
    const password = user.password;
    const auth_key = user.auth_key;
    // Test update (patch)
    await user.$query().patchAndFetch({
      username: "gazb"
    });
    expect(user.password).to.eql(password);
    expect(user.auth_key).to.eql(auth_key);
    expect(user.updated_at).to.be.a(Date);
    expect(user.created_at).to.eql(created_at);
    expect(user.updated_at).to.not.eql(updated_at);
  });
  it("tests User creates role assignments from config file", async function() {
    // Insert new user
    const user = await User.query().insertAndFetch({
      username: "gaz",
      email: "test@gazbond.co.uk",
      password: "Password1"
    });
    const roles = await user.$relatedQuery("roles");
    expect(roles).to.have.length(1);
  });
  it("tests User creates confirmation token", async function() {
    // Insert new user
    const user = await User.query().insertAndFetch({
      username: "gaz",
      email: "test@gazbond.co.uk",
      password: "Password1"
    });
    // Load tokens
    let tokens = await user.$relatedQuery("tokens");
    expect(tokens).to.have.length(1);
    // Search tokens
    let token = tokens[0];
    tokens = await Token.query().where({
      user_id: token.user_id,
      type: Token.TYPE_CONFIRMATION,
      code: token.code
    });
    expect(tokens).to.have.length(1);
  });
});
