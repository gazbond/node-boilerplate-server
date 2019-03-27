const Email = require("email-templates");
const nodemailer = require("nodemailer");

/**
 * ------------------------------------------------------
 * Config.
 * ------------------------------------------------------
 */
const environment = process.env.ENVIRONMENT || "development";
let configPath = "../../config/dev.conf";
if (environment == "testing") {
  configPath = "../../config/test.conf";
}
const config = require(configPath);

/**
 * Nodemailer transport
 */
const transport = nodemailer.createTransport(config.email.transport);

/**
 * Using email-templates.
 *
 * Directory structure:
 *    ./emails/template-name/
 *        subject.ejs
 *        text.ejs
 *        html.ejs
 */
const email = new Email({
  send: true,
  message: {
    from: config.email.from
  },
  transport: transport,
  views: {
    options: {
      extension: "ejs"
    }
  }
});

/**
 * Send email.
 *
 * @param {string} toAddress
 * @param {string} template
 * @param {{}} locals
 */
const sendEMail = (toAddress, template, locals) => {
  return email.send({
    template: template,
    message: {
      to: toAddress
    },
    locals: locals
  });
};

module.exports = { transport, sendEMail };
