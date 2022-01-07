exports.seed = async function(knex) {
  const { Model } = require("objection");
  Model.knex(knex);
  const faker = require("faker");
  const User = require("../../models/User");
  const Role = require("../../models/rbac/Role");
  const Permission = require("../../models/rbac/Permission");
  const Media = require("../../models/Media");
  const Submission = require("../../models/Submission");
  const Campaign = require("../../models/Campaign");

  await knex("app_debit").del();
  await knex("app_credit").del();
  await knex("app_comment").del();
  await knex("app_request").del();
  await knex("app_review").del();
  await knex("app_request").del();
  await knex("app_campaign").del();
  await knex("app_submission").del();
  await knex("app_profile").del();
  await knex("app_media").del();
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

  // Media
  const audio = await Media.query().insertAndFetch({
    user_id: submitterUser.id,
    type: "audio",
    url: "https://soundcloud.com/p3dals/98-times-bad"
  });
  const image = await Media.query().insertAndFetch({
    user_id: reviewerUser.id,
    type: "image",
    url: "https://i1.sndcdn.com/avatars-000488602248-893hp7-t200x200.jpg"
  });

  // Submission
  const submission = await Submission.query().insertAndFetch({
    submitter_id: submitterUser.id,
    track_id: audio.id,
    artwork_id: image.id,
    thumb_id: image.id
  });

  // Campaign
  const campaign = await Campaign.query().insertAndFetch({
    submitter_id: submitterUser.id,
    submission_id: submission.id,
    duration: 3,
    artwork_id: image.id,
    thumb_id: image.id
  });
};
