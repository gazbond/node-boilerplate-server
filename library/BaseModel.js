const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");
const VisibilityPlugin = require("objection-visibility").default;
const BaseClass = DbErrors(VisibilityPlugin(Model));

module.exports = class BaseModel extends BaseClass {
  constructor() {
    super();
    this.$autoTimestamps = true;
  }
  $beforeInsert(queryContext) {
    const maybePromise = super.$beforeInsert(queryContext);
    return Promise.resolve(maybePromise).then(() => {
      if (this.$autoTimestamps) {
        this.created_at = new Date().toISOString();
        this.updated_at = new Date().toISOString();
      }
    });
  }
  $beforeUpdate(opt, queryContext) {
    const maybePromise = super.$beforeUpdate(opt, queryContext);
    return Promise.resolve(maybePromise).then(() => {
      if (this.$autoTimestamps) {
        this.updated_at = new Date().toISOString();
      }
    });
  }
};
