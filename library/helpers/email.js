const Email = require("email-templates");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

/**
 * ------------------------------------------------------
 * Config.
 * ------------------------------------------------------
 */
const { email } = require("../../config");

/**
 * Using nodemailer.
 */
const transport = nodemailer.createTransport(email.transport);

/**
 * Using email-templates.
 *
 * Directory structure:
 *    ./emails/template-name/
 *        subject.ejs
 *        text.ejs
 *        html.ejs
 */
const emailTemplate = new Email({
  send: true,
  preview: false,
  message: {
    from: email.from
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
const sendEmail = async (toAddress, template, locals) => {
  const response = await emailTemplate.send({
    template: template,
    message: {
      to: toAddress
    },
    locals: locals
  });
  // Write email to file
  if (email.transport.jsonTransport) {
    // Paths
    const basePath = path.resolve(__dirname, "../../tests/_output/emails/");
    const outputPath = `${basePath}/${template}/`;
    const outputFile = `${outputPath}${toAddress}.json`;
    // Create output directories
    if (!fs.existsSync(outputFile)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    // Remove if exists
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
    // Write file
    const output = JSON.stringify(response.originalMessage);
    fs.writeFileSync(outputFile, output, "utf8");
  }
};

module.exports = { transport, sendEmail };
