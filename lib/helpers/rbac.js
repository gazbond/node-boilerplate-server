const auth = require("express-rbac");

const init = auth.authorize(
  {
    bindToProperty: "user"
  },
  (req, done) => {
    // Flatten roles/permissions
    const roles = [];
    const permissions = [];
    req.user.roles.forEach(role => {
      roles.push(role.name);
      role.permissions.forEach(perm => {
        permissions.push(perm.name);
      });
    });
    // Return roles/permissions
    return done({
      roles: roles,
      permissions: permissions
    });
  }
);

module.exports = {
  init: init,
  auth: auth
};
