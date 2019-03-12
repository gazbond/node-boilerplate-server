const expect = require("expect.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
chai.use(chaiHttp);

const knex = require("../knex");

before(async function() {
  await knex.migrate.latest();
});
beforeEach(async function() {
  await knex.seed.run();
});
after(async function() {
  await knex.destroy();
});

describe("Initial api tests", function() {
  it("tests user api endpoint fails without authentication", async function() {
    const response = await chai.request("http://node:8080").get("/api/users");
    expect(response.status).to.be(401);
    expect(response.body).not.be.an(Array);
  });
});
