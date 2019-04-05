const expect = require("expect.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const { knex } = require("../../config");
const server = "http://nodetest:7070";

let token;
before(async function() {
  await knex.migrate.latest();
  await knex.seed.run({
    directory: "./seeds/test"
  });
  // Login form returns { Authorization: <token> }
  const login = await chai
    .request(server)
    .post("/security/login")
    .set("Content-Type", "application/json")
    .send({
      login: "root",
      password: "password"
    });
  token = login.body.Authorization;
});
after(async function() {
  await knex.destroy();
});

describe("Test UserEndpoint", function() {
  it("test UserEndpoint index and view actions", async function() {
    const response = await chai
      .request(server)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an(Array);
    response.body.forEach(async user => {
      const id = user.id;
      const current = await chai
        .request(server)
        .get(`/api/users/${id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(current.status).to.equal(200);
      expect(current.body.id).to.equal(id);
    });
  });
  let id;
  it("test UserEndpoint create action", async function() {
    const response = await chai
      .request(server)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "gazb",
        email: "me@notu.com",
        password: "password"
      });
    id = response.body.id;
    expect(response.status).to.equal(200);
    expect(response.body.username).to.eql("gazb");
    expect(response.body.email).to.eql("me@notu.com");
  });
  it("test UserEndpoint update action", async function() {
    const response = await chai
      .request(server)
      .put(`/api/users/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "you@notme.com"
      });
    expect(response.status).to.equal(200);
    expect(response.body.username).to.eql("gazb");
    expect(response.body.email).to.eql("you@notme.com");
  });
  it("test UserEndpoint delete action", async function() {
    let response = await chai
      .request(server)
      .delete(`/api/users/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(200);
    response = await chai
      .request(server)
      .get(`/api/users/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(404);
  });
  it("test UserEndpoint actions with non existant ids", async function() {
    let response = await chai
      .request(server)
      .get(`/api/users/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(404);
    response = await chai
      .request(server)
      .put(`/api/users/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(404);
    response = await chai
      .request(server)
      .delete(`/api/users/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(404);
  });
});
