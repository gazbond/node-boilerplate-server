const expect = require("expect.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const knex = require("../../config/test.conf").knex;
const app = require("../../app");

before(async function() {
  await knex.migrate.latest();
  await knex.seed.run();
});
after(async function() {
  await knex.destroy();
});

describe("Test JWT authentication", function() {
  it("test UserEndpoint fails authentication", async function() {
    const response = await chai.request(app).get("/api/users");
    expect(response.status).to.equal(401);
  });
  it("test UserEndpoint passes authentication", async function() {
    // Login form returns { Authorization: <token> }
    const login = await chai
      .request(app)
      .post("/security/login")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        login: "root",
        password: "password"
      });
    expect(login.status).to.eql(200);
    const token = login.body.Authorization;
    const response = await chai
      .request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.eql(200);
    expect(response.body.results).to.be.an(Array);
  });
});
