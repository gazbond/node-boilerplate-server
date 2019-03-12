const expect = require("expect.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
chai.use(chaiHttp);

describe("Test UserEndpoint and JWT authentication", function() {
  it("test failing authentication", async function() {
    const response = await chai.request("http://node:8080").get("/api/users");
    expect(response.status).to.equal(401);
  });
  it("test passing authentication", async function() {
    const login = await chai
      .request("http://node:8080")
      .post("/security/login")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        login: "root",
        password: "password"
      });
    expect(login.status).to.equal(200);
    const token = login.body.Authorization;
    const response = await chai
      .request("http://node:8080")
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.an(Array);
  });
});
