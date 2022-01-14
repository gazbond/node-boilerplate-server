const { Model } = require("objection");
const { DbErrors } = require("objection-db-errors");
const VisibilityPlugin = require("objection-visibility").default;
const BaseClass = DbErrors(VisibilityPlugin(Model));
const { getBody } = require("../library/helpers/utils");
const { elastic } = require("../config");

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
  /**
   * Insert ElasticSearch index.
   */
  async $afterInsert(queryContext) {
    await super.$afterInsert(queryContext);
    // @ts-ignore
    const index = this.constructor.indexName;
    if (index !== undefined) {
      // @ts-ignore
      const type = this.constructor.indexType || null;
      // Insert index
      let body = getBody(this.constructor, this);
      await elastic.index({
        index: index,
        type: type,
        id: this.id,
        body: body,
        refresh: true
      });
    }
  }
  /**
   * Update ElasticSearch index.
   */
  async $afterUpdate(opt, queryContext) {
    await super.$afterUpdate(opt, queryContext);
    // @ts-ignore
    const index = this.constructor.indexName;
    if (index !== undefined) {
      // @ts-ignore
      const type = this.constructor.indexType || null;
      // Update index
      let body = getBody(this.constructor, this);
      await elastic.index({
        index: index,
        type: type,
        id: this.id,
        body: body,
        refresh: true
      });
    }
  }
  /**
   * Delete ElasticSearch index.
   */
  async $afterDelete(queryContext) {
    await super.$afterDelete(queryContext);
    // @ts-ignore
    const index = this.constructor.indexName;
    if (index !== undefined) {
      // @ts-ignore
      const type = this.constructor.indexType || null;
      // Delete index
      await elastic.delete({
        index: index,
        type: type,
        id: this.id,
        refresh: true
      });
    }
  }
};
