const expect = require("expect.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const server = "http://nodetest:7070";

describe("Test PermissionEndpoint", async function() {
  // Login:
  let token;
  it("test PermissionEndpoint login to /security/login", async function() {
    // Login form returns { Authorization: <token> }
    const login = await chai
      .request(server)
      .post("/security/login")
      .set("Content-Type", "application/json")
      .send({
        login: "root",
        password: "Password1"
      });
    token = login.body.Authorization;
  });
  // Tests:
  it("test PermissionEndpoint index and view actions", async function() {
    const response = await chai
      .request(server)
      .get("/api/permissions")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an(Array);
    expect(response.body.length).to.equal(2);
    for (let i = 0; i < response.body.length; i++) {
      const name = response.body[i].name;
      const current = await chai
        .request(server)
        .get(`/api/permissions/${name}`)
        .set("Authorization", `Bearer ${token}`);
      expect(current.status).to.equal(200);
      expect(current.body.name).to.equal(name);
    }
  });
  let name;
  it("test PermissionEndpoint create action", async function() {
    const response = await chai
      .request(server)
      .post("/api/permissions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "new-permission"
      });
    name = response.body.name;
    expect(response.status).to.equal(200);
    expect(response.body.name).to.eql("new-permission");
  });
  it("test PermissionEndpoint delete action", async function() {
    let response = await chai
      .request(server)
      .delete(`/api/permissions/${name}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(200);
    response = await chai
      .request(server)
      .get(`/api/permissions/${name}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(404);
  });
  it("test PermissionEndpoint actions with non existant ids", async function() {
    let response = await chai
      .request(server)
      .get(`/api/permissions/${name}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(404);
    response = await chai
      .request(server)
      .delete(`/api/permissions/${name}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(404);
  });
});
