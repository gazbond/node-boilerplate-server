const expect = require("expect.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

let token;
before(async function() {
  const login = await chai
    .request("http://node:8080")
    .post("/security/login")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send({
      login: "root",
      password: "password"
    });
  token = login.body.Authorization;
});

describe("Test UserEndpoint", function() {
  it("test UserEndpoint index and view actions", async function() {
    const response = await chai
      .request("http://node:8080")
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(200);
    expect(response.body.results).to.be.an(Array);
    response.body.results.forEach(async user => {
      const id = user.id;
      const current = await chai
        .request("http://node:8080")
        .get(`/api/users/${id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(current.status).to.equal(200);
      expect(current.body.id).to.equal(id);
    });
  });
  let id;
  it("test UserEndpoint create action", async function() {
    const response = await chai
      .request("http://node:8080")
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "gazb",
        email: "me@notu.com",
        password_hash: "password"
      });
    expect(response.status).to.equal(200);
    expect(response.body.username).to.eql("gazb");
    expect(response.body.email).to.eql("me@notu.com");
    id = response.body.id;
  });
  it("test UserEndpoint update action", async function() {
    const response = await chai
      .request("http://node:8080")
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
      .request("http://node:8080")
      .delete(`/api/users/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(200);
    response = await chai
      .request("http://node:8080")
      .get(`/api/users/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(404);
  });
});
