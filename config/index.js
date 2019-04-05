/**
 * ------------------------------------------------------
 * Config.
 * ------------------------------------------------------
 */
const chalk = require("chalk").default;
const environment = process.env.NODE_ENV || "development";
console.log(chalk.yellow("environment:"), chalk.green(environment));
let configPath = "./dev.conf";
if (environment === "testing") {
  configPath = "./test.conf";
}
const config = require(configPath);
/**
 * Validate.
 */
const Ajv = require("ajv");
const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
const validate = ajv.compile({
  type: "object",
  required: ["name", "knex", "jwt", "models"],
  properties: {
    name: { type: "string" },
    jwt: {
      type: "object",
      required: ["secretOrKey", "expiresIn"],
      properties: {
        secretOrKey: { type: "string" },
        expiresIn: { type: "string" }
      }
    },
    models: {
      type: "object",
      required: ["user"],
      properties: {
        user: {
          type: "object",
          required: [
            "emailConfirmation",
            "roles",
            "confirmWithin",
            "recoverWithin"
          ],
          properties: {
            emailConfirmation: { type: "boolean" },
            roles: { type: "array" },
            confirmWithin: { type: "string" },
            recoverWithin: { type: "string" }
          }
        }
      }
    }
  }
});
const valid = validate(config);
if (!valid) {
  // Log errors in red
  let messages = [];
  validate.errors.forEach(err => messages.push(err.message));
  console.log(chalk.red("Invalid Configuration: ", messages.join(", ")));
}
module.exports = config;
