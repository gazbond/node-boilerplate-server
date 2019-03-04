const expect = require("expect.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
chai.use(chaiHttp);

const objection = require("objection");
const knex = require("../knex");
const db = require("../../models")(knex);

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
  it("tests user api endpoint loads data", async function() {
    const response = await chai.request("http://node").get("/api/users");
    expect(response.body).to.be.an(Array);
    expect(response.body).length(2);
  });
});
