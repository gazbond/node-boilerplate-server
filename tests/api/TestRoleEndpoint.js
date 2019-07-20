const expect = require("expect.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const server = "http://nodetest:7070";

describe("Test RoleEndpoint", async function() {
  // Login:
  let token;
  it("test RoleEndpoint login to /security/login", async function() {
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
  it("test RoleEndpoint index and view actions", async function() {
    const response = await chai
      .request(server)
      .get("/api/roles")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an(Array);
    for (let i = 0; i < response.body.length; i++) {
      const name = response.body[i].name;
      const current = await chai
        .request(server)
        .get(`/api/roles/${name}`)
        .set("Authorization", `Bearer ${token}`);
      expect(current.status).to.equal(200);
      expect(current.body.name).to.equal(name);
    }
  });
  let name;
  it("test RoleEndpoint create action", async function() {
    const response = await chai
      .request(server)
      .post("/api/roles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "new-role"
      });
    name = response.body.name;
    expect(response.status).to.equal(200);
    expect(response.body.name).to.eql("new-role");
  });
  it("test RoleEndpoint assign and remove permission", async function() {
    const permissionName = "new-permission";
    let response = await chai
      .request(server)
      .post("/api/permissions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: permissionName
      });
    expect(response.status).to.equal(200);
    expect(response.body.name).to.eql(permissionName);
    response = await chai
      .request(server)
      .post(`/api/roles/${name}/permission`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: permissionName
      });
    expect(response.status).to.equal(200);
    let permissionNames = [];
    response.body.permissions.forEach(permission =>
      permissionNames.push(permission.name)
    );
    expect(permissionNames).to.contain(permissionName);
    response = await chai
      .request(server)
      .delete(`/api/roles/${name}/permission/${permissionName}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(200);
    permissionNames = [];
    response.body.permissions.forEach(permission =>
      permissionNames.push(permission.name)
    );
    expect(permissionNames).not.contain(permissionName);
  });
  it("test RoleEndpoint delete action", async function() {
    let response = await chai
      .request(server)
      .delete(`/api/roles/${name}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(200);
    response = await chai
      .request(server)
      .get(`/api/roles/${name}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(404);
  });
  it("test RoleEndpoint actions with non existant ids", async function() {
    let response = await chai
      .request(server)
      .get(`/api/roles/${name}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(404);
    expect(response.status).to.equal(404);
    response = await chai
      .request(server)
      .delete(`/api/roles/${name}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(404);
  });
});
