const expect = require("expect.js");
const { transport, sendEMail } = require("../../library/helpers/email");

after(async function() {
  await transport.close();
});

describe("Test email helper", function() {
  it("tests sending email with register template", async function() {
    const response = await sendEMail("dev@gazbond.co.uk", "register", {
      name: "node-boilerplate-server",
      username: "Gazbond",
      email: "dev@gazbond.co.uk",
      url: "link-goes-here"
    });
    expect(response).to.have.property("messageId");
  });
});
