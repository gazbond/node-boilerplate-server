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

describe("Testing SecurityController", function() {
  it("test...", async function() {
    const response = await chai.request("http://node").get("/security/login");
    console.log("response: ", response.status);
  });
});
