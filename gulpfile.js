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
async function deleteIndices(cp) {
  await elastic.indices.delete({ index: "_all" });
  cp();
}
exports.deleteIndices = deleteIndices;

/**
 * Create indices.
 */
async function createIndices(cp) {
  /**
   * Indices for User model:
   */
  await elastic.indices.create({ index: User.indexName });
  cp();
}
exports.createIndices = createIndices;

/**
 * Put mappings.
 */
async function putMappings(cp) {
  /**
   * Mappings for User model:
   */
  await elastic.indices.putMapping({
    index: User.indexName,
    type: User.indexType,
    body: User.indexMappings
  });
  cp();
}
exports.putMappings = putMappings;

/**
 * Re-index data from models.
 */
async function reIndex(cp) {
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
  cp();
}
exports.reIndex = reIndex;

/**
 * Generate Elastic Model class file **helpers**
 * Reads existing Model class as template.
 * Import model and set Model below.
 */
async function elasticModel(cp) {
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
  cp();
}
exports.elasticModel = elasticModel;

/**
 * Delete and re-create indices and put mappings.
 */
exports.default = exports.setupIndices = series(
  deleteIndices,
  createIndices,
  putMappings
);
