const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");
const VisibilityPlugin = require("objection-visibility").default;
const BaseClass = DbErrors(VisibilityPlugin(Model));

module.exports = class BaseModel extends BaseClass {
  constructor() {
    super();
    this.$autoTimestamps = true;
  }
  /**
   * Generate created/updated timestamps.
   */
  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    if (this.$autoTimestamps) {
      this.created_at = new Date().toISOString();
      this.updated_at = new Date().toISOString();
    }
  }
  /**
   * Generate updated timestamp.
   */
  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext);
    if (this.$autoTimestamps) {
      this.updated_at = new Date().toISOString();
    }
  }
};
