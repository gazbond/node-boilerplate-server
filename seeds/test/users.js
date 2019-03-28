exports.seed = async function(knex) {
  const { Model } = require("objection");
  Model.knex(knex);

  await knex("rbac_role_assignment").del();
  await knex("rbac_permission_assignment").del();
  await knex("rbac_permission").del();
  await knex("rbac_role").del();
  await knex("user_identity").del();

  const User = require("../../models/User");
  const rootUser = await User.query().insertAndFetch({
    username: "root",
    email: "dev@gazbond.co.uk",
    password: "password"
  });
  const gazbondUser = await User.query().insertAndFetch({
    username: "gazbond",
    email: "gaz@gazbond.co.uk",
    password: "password"
  });
  const Role = require("../../models/rbac/Role");
  const adminRole = await Role.query().insertAndFetch({
    name: "admin"
  });

  const userRole = await Role.query().insertAndFetch({
    name: "user"
  });

  const Permission = require("../../models/rbac/Permission");
  const writePerm = await Permission.query().insertAndFetch({
    name: "can-write-api"
  });

  const readPerm = await Permission.query().insertAndFetch({
    name: "can-read-api"
  });

  await adminRole.assignPermissions([writePerm, readPerm]);
  await userRole.assignPermission(readPerm);
  await rootUser.assignRoles([adminRole, userRole]);
  await gazbondUser.assignRole(userRole);
};