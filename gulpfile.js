const { series } = require("gulp");
const { knex, elastic } = require("./config");
const { getBody } = require("./library/helpers/utils");

// Provide connection to models.
const { Model } = require("objection");
Model.knex(knex);

// Models:
const User = require("./models/User");

/**
 * Delete all indices.
 */
async function delete_indices(cb) {
  await elastic.indices.delete({ index: "_all" });
  cb();
}
exports.delete_indices = delete_indices;

/**
 * Create indices.
 */
async function create_indices(cb) {
  /**
   * Indices for User model:
   */
  await elastic.indices.create({ index: User.indexName });
  cb();
}
exports.create_indices = create_indices;

/**
 * Put mappings.
 */
async function put_mappings(cb) {
  /**
   * Mappings for User model:
   */
  await elastic.indices.putMapping({
    index: User.indexName,
    type: User.indexType,
    body: User.indexMappings
  });
  cb();
}
exports.put_mappings = put_mappings;

/**
 * Re-index data from models.
 */
async function re_index(cb) {
  /**
   * Re-index for User model:
   */
  const users = await User.query();
  for (let i = 0; i < users.length; i++) {
    let body = getBody(User, users[i]);
    await elastic.index({
      index: User.indexName,
      type: User.indexType,
      id: users[i].id,
      body: body
    });
  }
  await knex.destroy();
  cb();
}
exports.re_index = re_index;

/**
 * Generate Elastic Model class file **helpers**
 * Reads existing Model class as template.
 * Import model and set Model below.
 */
async function elastic_model(cb) {
  // Model to read from
  const Model = User;
  const lookup = {
    "character varying": "text",
    boolean: "boolean",
    integer: "long",
    float: "float",
    decimal: "float",
    "timestamp with time zone": "date"
    /*
    char:  '',
    bigint:  '',
    smallint:  '',
    binary:  '',
    money:  '',
    */
  };
  // Create {} of attribute names: type (integer, float etc.)
  let namesTypes = {
    dynamic: "strict",
    properties: {}
  };
  const columns = await knex.table(Model.tableName).columnInfo();
  Object.keys(columns).forEach(function(key) {
    const type = columns[key].type;
    namesTypes["properties"][key] = {
      type: lookup[type]
    };
  });
  // Generated default indexMappings() for Model.
  console.log(namesTypes);
  await knex.destroy();
  cb();
}
exports.elastic_model = elastic_model;

/**
 * Delete and re-create indices and put mappings.
 */
exports.default = exports.setup_indices = series(
  delete_indices,
  create_indices,
  put_mappings
);
