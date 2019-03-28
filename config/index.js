/**
 * ------------------------------------------------------
 * Config.
 * ------------------------------------------------------
 */
const environment = process.env.ENVIRONMENT || "development";
let configPath = "./dev.conf";
if (environment == "testing") {
  configPath = "./test.conf";
}
module.exports = require(configPath);
