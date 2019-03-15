const rbac = require("express-rbac");

/**
 * Expects req.user to be set by passport helper.
 * Flattens roles/permissions.
 */
const auth = rbac.authorize(
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
  auth: auth,
  isInAnyRole: arg => rbac.isInAnyRole(arg),
  isInRole: arg => rbac.isInRole(arg),
  hasAnyPermission: arg => rbac.hasAnyPermission(arg),
  hasPermission: arg => rbac.hasPermission(arg)
};
