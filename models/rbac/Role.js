const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");
const VisibilityPlugin = require("objection-visibility").default;
const BaseClass = DbErrors(VisibilityPlugin(Model));

const Permission = require("./Permission");
const PermissionAssignment = require("./PermissionAssignment");

module.exports = class Role extends BaseClass {
  static get tableName() {
    return "rbac_role";
  }
  static get idColumn() {
    return "name";
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", minLength: 1, maxLength: 64 }
      }
    };
  }
  static get fields() {
    return ["name"];
  }
  static get visible() {
    return ["name", "permissions"];
  }
  static get relationMappings() {
    return {
      permissions: {
        relation: Model.ManyToManyRelation,
        modelClass: Permission,
        join: {
          from: "rbac_role.name",
          through: {
            from: "rbac_permission_assignment.role_name",
            to: "rbac_permission_assignment.permission_name"
          },
          to: "rbac_permission.name"
        }
      }
    };
  }
  /**
   * @param {Permission|string} permission
   */
  async assignPermission(permission) {
    let permissionName = permission;
    if (typeof permission === "object") {
      permissionName = permission.name;
    }
    await PermissionAssignment.query().insert({
      permission_name: permissionName,
      role_name: this.name
    });
  }
  /**
   * @param {Permission|string} permission
   */
  async removePermission(permission) {
    let permissionName = permission;
    if (typeof permission === "object") {
      permissionName = permission.name;
    }
    await PermissionAssignment.query().deleteById([permissionName, this.name]);
  }
  /**
   * @param {Permission[]|string[]} permissions
   */
  async assignPermissions(permissions) {
    const inserts = [];
    permissions.forEach(permission => {
      let permissionName = permission;
      if (typeof permission === "object") {
        permissionName = permission.name;
      }
      inserts.push({
        permission_name: permissionName,
        role_name: this.name
      });
    });
    await PermissionAssignment.query().insert(inserts);
  }
  /**
   * @param {Permission[]|string[]} permissions
   */
  async removePermissions(permissions) {
    const deletes = [];
    permissions.forEach(permission => {
      let permissionName = permission;
      if (typeof permission === "object") {
        permissionName = permission.name;
      }
      deletes.push([permissionName, this.name]);
    });
    await PermissionAssignment.query()
      .delete()
      .whereInComposite(["permission_name", "role_name"], deletes);
  }
  /**
   * Remove permission assignments.
   */
  async $beforeDelete(queryContext) {
    await super.$beforeDelete(queryContext);
    // Load permissions
    const permissions = await this.$relatedQuery("permissions");
    // Remove permission assignments
    if (permissions && permissions.length > 0) {
      await this.removePermissions(permissions);
    }
  }
};
