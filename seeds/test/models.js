exports.seed = async function(knex) {
  const { Model } = require("objection");
  Model.knex(knex);
  const faker = require("faker");
  const User = require("../../models/User");
  const Role = require("../../models/rbac/Role");
  const Permission = require("../../models/rbac/Permission");

  await knex("rbac_role_assignment").del();
  await knex("rbac_permission_assignment").del();
  await knex("rbac_permission").del();
  await knex("rbac_role").del();
  await knex("user_token").del();
  await knex("user_identity").del();

  /**
   * Roles/Permissions.
   */
  const adminRole = await Role.query().insertAndFetch({
    name: "admin"
  });
  const submitterRole = await Role.query().insertAndFetch({
    name: "submitter"
  });
  const reviewerRole = await Role.query().insertAndFetch({
    name: "reviewer"
  });
  const writePerm = await Permission.query().insertAndFetch({
    name: "can-write-api"
  });
  const readPerm = await Permission.query().insertAndFetch({
    name: "can-read-api"
  });
  await adminRole.assignPermissions([writePerm, readPerm]);
  await submitterRole.assignPermissions([writePerm, readPerm]);
  await reviewerRole.assignPermissions([writePerm, readPerm]);

  /**
   * Root user with additional admin and reviewer roles.
   */
  const adminUser = await User.query().insertAndFetch({
    status: "active",
    username: "root",
    email: "dev@gazbond.co.uk",
    password: "Password1",
    confirmed_at: new Date().toISOString()
  });
  await adminUser.assignRole(adminRole);
  await adminUser.assignRole(reviewerRole);

  /**
   * User with default role (submitter)
   */
  const submitterUser = await User.query().insertAndFetch({
    status: "active",
    username: "gazbond",
    email: "gazbond@gazbond.co.uk",
    password: "Password1",
    confirmed_at: new Date().toISOString()
  });
  /**
   * User with reviewer role.
   */
  const reviewerUser = await User.query().insertAndFetch({
    status: "active",
    username: "gazza",
    email: "gazza@gazbond.co.uk",
    password: "Password1",
    confirmed_at: new Date().toISOString()
  });
  await reviewerUser.removeRole(submitterRole);
  await reviewerUser.assignRole(reviewerRole);
};
