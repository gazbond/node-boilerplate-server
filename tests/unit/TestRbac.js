process.env.ENVIRONMENT = "testing";

const expect = require("expect.js");

const { knex } = require("../../config");
const User = require("../../models/User");
const Role = require("../../models/rbac/Role");
const Permission = require("../../models/rbac/Permission");
const RoleAssignment = require("../../models/rbac/RoleAssignment");
const PermissionAssignment = require("../../models/rbac/PermissionAssignment");

before(async function() {
  await knex.migrate.latest();
});
beforeEach(async function() {
  await knex.seed.run({
    directory: "./seeds/test"
  });
});
after(async function() {
  await knex.destroy();
});

describe("Test rbac models", function() {
  it("tests removeRole(Role) and removePermission(Permission)", async function() {
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
    // Remove role and permission
    await user.removeRole(role);
    await role.removePermission(permission);
    // Check removals worked
    const roles = await user.$relatedQuery("roles");
    expect(roles).to.have.length(1);
    const permissions = await role.$relatedQuery("permissions");
    expect(permissions).to.have.length(1);
  });
  it("tests removeRole(string) and removePermission(string)", async function() {
    // Load user
    const user = await User.query()
      .eager("roles")
      .where({
        username: "root"
      })
      .first();
    expect(user.roles).to.have.length(2);
    // Load role
    const role = await Role.query()
      .eager("permissions")
      .findById("admin");
    expect(role.permissions).to.have.length(2);
    // Remove role and permission
    await user.removeRole("admin");
    await role.removePermission("can-read-api");
    // Check removals worked
    const roles = await user.$relatedQuery("roles");
    expect(roles).to.have.length(1);
    const permissions = await role.$relatedQuery("permissions");
    expect(permissions).to.have.length(1);
  });
  it("tests removeRoles([string]) and removePermissions([string])", async function() {
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
    // Remove roles and permissions
    await user.removeRoles(["admin", "user"]);
    await role.removePermissions(["can-read-api", "can-write-api"]);
    // Check removals worked
    const roles = await user.$relatedQuery("roles");
    expect(roles).to.have.length(0);
    const permissions = await role.$relatedQuery("permissions");
    expect(permissions).to.have.length(0);
  });
  it("tests deleting User removes role assignments", async function() {
    // Load user
    const gazbond = await User.query()
      .where({
        username: "gazbond"
      })
      .first();
    const user_id = gazbond.id;
    // Delete user
    await gazbond.$query().delete();
    // Check assignments are gone
    const assignments = await RoleAssignment.query().where({
      user_id: user_id
    });
    expect(assignments).to.have.length(0);
  });
  it("tests deleting Role removes permission assignments", async function() {
    // Load role and user
    const role = await Role.query().findById("admin");
    const root = await User.query()
      .where({
        username: "root"
      })
      .first();
    // Remove role from user
    await root.removeRole(role);
    // Delete role
    await role.$query().delete();
    // Check assignments are gone
    const assignments = await PermissionAssignment.query().where({
      role_name: "admin"
    });
    expect(assignments).to.have.length(0);
  });
});
