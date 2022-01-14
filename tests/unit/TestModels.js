const expect = require("expect.js");

const User = require("../../models/User");

describe("Test common model features", function() {
  it("tests model relations are working", async function() {
    const user = await User.query().insertAndFetch({
      status: "active",
      username: "testing_relations_user",
      email: "bass@gazbond.co.uk",
      password: "Password1",
      confirmed_at: new Date().toISOString()
    });
  });
  it("tests model validations are working", async function() {
    let user;
    try {
      user = await User.query().insertAndFetch({
        status: "wrong",
        username: "invalid username",
        email: "invalid email",
        password: "invalid password"
      });
    } catch (err) {
      expect(err.statusCode).to.equal(400);
      expect(err.data).to.have.property("status");
      expect(err.data).to.have.property("username");
      expect(err.data).to.have.property("email");
      expect(err.data).to.have.property("password");
    }
    user = await User.query().insertAndFetch({
      username: "testing_validations_user",
      email: "test@gazbond.co.uk",
      password: "Password1"
    });
  });
});
