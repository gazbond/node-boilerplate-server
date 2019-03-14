exports.seed = async function(knex) {
  const { Model } = require("objection");
  Model.knex(knex);

  await knex("rbac_role_assignment").del();
  await knex("rbac_permission_assignment").del();
  await knex("rbac_permission").del();
  await knex("rbac_role").del();
  await knex("user_identity").del();

  const User = require("../models/User");
  // @ts-ignore
  const rootUser = await User.query().insert({
    username: "root",
    email: "dev@gazbond.co.uk",
    password_hash: "password"
  });
  // @ts-ignore
  await User.query().insert({
    username: "gazbond",
    email: "gaz@gazbond.co.uk",
    password_hash: "password"
  });
  const Role = require("../models/rbac/Role");
  // @ts-ignore
  const role = await Role.query()
    .insert({
      name: "admin"
    })
    .returning("*");

  const Permission = require("../models/rbac/Permission");
  // @ts-ignore
  const permission = await Permission.query()
    .insert({
      name: "can-access-api"
    })
    .returning("*");

  await role.$assignPermission(permission);
  await rootUser.$assignRole(role);
};
