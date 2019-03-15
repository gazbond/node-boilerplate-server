exports.seed = async function(knex) {
  const { Model } = require("objection");
  Model.knex(knex);

  await knex("rbac_role_assignment").del();
  await knex("rbac_permission_assignment").del();
  await knex("rbac_permission").del();
  await knex("rbac_role").del();
  await knex("user_identity").del();

  const User = require("../models/User");
  const rootUser = await User.query().insert({
    username: "root",
    email: "dev@gazbond.co.uk",
    password_hash: "password"
  });
  const gazbondUser = await User.query().insert({
    username: "gazbond",
    email: "gaz@gazbond.co.uk",
    password_hash: "password"
  });
  const Role = require("../models/rbac/Role");
  const adminRole = await Role.query()
    .insert({
      name: "admin"
    })
    .returning("*");

  const userRole = await Role.query()
    .insert({
      name: "user"
    })
    .returning("*");

  const Permission = require("../models/rbac/Permission");
  const writePerm = await Permission.query()
    .insert({
      name: "can-write-api"
    })
    .returning("*");

  const readPerm = await Permission.query()
    .insert({
      name: "can-read-api"
    })
    .returning("*");

  await adminRole.assignPermissions([writePerm, readPerm]);
  await userRole.assignPermission(readPerm);
  await rootUser.assignRoles([adminRole, userRole]);
  await gazbondUser.assignRole(userRole);
};
