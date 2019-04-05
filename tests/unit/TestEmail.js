const path = require("path");
const fs = require("fs");
const expect = require("expect.js");
const { transport, sendEmail } = require("../../library/helpers/email");

after(async function() {
  await transport.close();
});

describe("Test email helper", function() {
  it("tests sending email with confirmation template", async function() {
    await sendEmail("dev@gazbond.co.uk", "confirmation", {
      name: "node-boilerplate-server",
      username: "Gazbond",
      email: "dev@gazbond.co.uk",
      url: "link-goes-here"
    });
    const file = JSON.parse(
      await fs.readFileSync(
        path.resolve(
          __dirname,
          "../_output/emails/confirmation/dev@gazbond.co.uk.json"
        ),
        "utf8"
      )
    );
    expect(file).to.have.property("to");
    expect(file).to.have.property("subject");
    expect(file.to).to.equal("dev@gazbond.co.uk");
    expect(file.subject).to.equal(
      "Hi Gazbond, welcome to node-boilerplate-server"
    );
  });
});
