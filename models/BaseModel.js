const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");
const visibilityPlugin = require("objection-visibility").default;
const BaseClass = DbErrors(visibilityPlugin(Model));

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
  $beforeUpdate(queryContext) {
    const maybePromise = super.$beforeInsert(queryContext);
    return Promise.resolve(maybePromise).then(() => {
      if (this.$autoTimestamps) {
        this.updated_at = new Date().toISOString();
      }
    });
  }
};
