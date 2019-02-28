const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");

module.exports = class BaseModel extends DbErrors(Model) {
  constructor() {
    super();
    this.$autoTimestamps = true;
  }
  $beforeInsert() {
    if (this.$autoTimestamps) {
      this.created_at = new Date().toISOString();
      this.updated_at = new Date().toISOString();
    }
  }
  $beforeUpdate() {
    if (this.$autoTimestamps) {
      this.updated_at = new Date().toISOString();
    }
  }
};
