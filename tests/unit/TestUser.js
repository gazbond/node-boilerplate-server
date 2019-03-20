const expect = require("expect.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const { ValidationError } = require("objection");
const knex = require("../../config/test.conf").knex;
const User = require("../../models/User");
const Role = require("../../models/rbac/Role");
const Permission = require("../../models/rbac/Permission");

const { sleep } = require("../../library/helpers/utils");

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
      password: "password"
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
  it("tests User removing roles and permissions", async function() {
    // Load user
    const user = await User.query()
      .eager("roles")
      .where({
        username: "root"
      })
      .first();
    expect(user.roles).to.have.length(2);
    // Load role and permission
    const role = await Role.query()
      .eager("permissions")
      .findById("admin");
    expect(role.permissions).to.have.length(2);
    const permission = await Permission.query().findById("can-read-api");
    // Remove role/permission
    user.removeRole(role);
    role.removePermission(permission);
    // Check removals worked
    const roles = await user.$relatedQuery("roles");
    expect(roles).to.have.length(1);
    const permissions = await role.$relatedQuery("permissions");
    expect(permissions).to.have.length(1);
  });
});
