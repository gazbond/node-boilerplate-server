const expect = require("expect.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const server = "http://nodetest:7070";

describe("Test UserEndpoint", async function() {
  // Login:
  let token;
  it("Login to /security/login", async function() {
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
  // Tests:
  it("test UserEndpoint index and view actions", async function() {
    const response = await chai
      .request(server)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an(Array);
    for (let i = 0; i < response.body.length; i++) {
      const id = response.body[i].id;
      const current = await chai
        .request(server)
        .get(`/api/users/${id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(current.status).to.equal(200);
      expect(current.body.id).to.equal(id);
    }
  });
  let id;
  it("test UserEndpoint create action", async function() {
    const response = await chai
      .request(server)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "gazb",
        email: "me@email.com",
        password: "password"
      });
    id = response.body.id;
    expect(response.status).to.equal(200);
    expect(response.body.username).to.eql("gazb");
    expect(response.body.email).to.eql("me@email.com");
  });
  it("test UserEndpoint update action", async function() {
    const response = await chai
      .request(server)
      .put(`/api/users/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "you@email.com"
      });
    expect(response.status).to.equal(200);
    expect(response.body.username).to.eql("gazb");
    expect(response.body.email).to.eql("you@email.com");
  });
  it("test UserEndpoint assign and remove role", async function() {
    const roleName = "new-role";
    let response = await chai
      .request(server)
      .post("/api/roles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: roleName
      });
    expect(response.status).to.equal(200);
    expect(response.body.name).to.eql(roleName);
    response = await chai
      .request(server)
      .post(`/api/users/${id}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: roleName
      });
    expect(response.status).to.equal(200);
    let roleNames = [];
    response.body.roles.forEach(role => roleNames.push(role.name));
    expect(roleNames).to.contain(roleName);
    response = await chai
      .request(server)
      .delete(`/api/users/${id}/role/${roleName}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(200);
    roleNames = [];
    response.body.roles.forEach(role => roleNames.push(role.name));
    expect(roleNames).not.contain(roleName);
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
