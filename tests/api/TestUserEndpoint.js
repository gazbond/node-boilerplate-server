const expect = require("expect.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const server = "http://nodetest:7070";

describe("Test UserEndpoint", async function() {
  // Login:
  let token;
  it("test UserEndpoint login to /security/login", async function() {
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
  it("test UserEndpoint index and view actions", async function() {
    const response = await chai
      .request(server)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an(Array);
    expect(response.body.length).to.equal(2);
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
        password: "Password1"
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
  it("test UserEndpoint 'filter' param with index (elasticsearch)", async function() {
    let response = await chai
      .request(server)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .set({
        "X-Filter": JSON.stringify({
          match: {
            username: "root"
          }
        })
      })
      .set({
        "X-Sort": JSON.stringify({ updated_at: { order: "DESC" } })
      });
    expect(response.status).to.equal(200);
    expect(response.body.length).to.equal(1);
    expect(response.body[0].email).to.eql("dev@gazbond.co.uk");
  });
  it("test UserEndpoint 'filter' and 'order' param with index (postgresql)", async function() {
    let response = await chai
      .request(server)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .set({
        "X-Filter": JSON.stringify({
          "username:eq": "root"
        })
      })
      .set({
        "X-Sort": "id"
      })
      .set({
        "X-Order": "ASC"
      });
    expect(response.status).to.equal(200);
    expect(response.body.length).to.equal(1);
    expect(response.body[0].email).to.eql("dev@gazbond.co.uk");
  });
  it("test UserEndpoint pagination with index", async function() {
    let response = await chai
      .request(server)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .query({
        page: 1,
        perPage: 1
      });
    expect(response.status).to.equal(200);
    expect(response.body.length).to.equal(1);
    const user = response.body[0];
    response = await chai
      .request(server)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .query({
        page: 2,
        perPage: 1
      });
    expect(response.status).to.equal(200);
    expect(response.body.length).to.equal(1);
    expect(response.body[0].id).to.not.equal(user.id);
  });
  it("test UserEndpoint 'sort' param with index", async function() {
    // Update a timestamp
    let response = await chai
      .request(server)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);
    response = await chai
      .request(server)
      .put(`/api/users/${response.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "you@email.com"
      });
    // List ascending
    response = await chai
      .request(server)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .set(
        "X-Filter",
        JSON.stringify({
          bool: {
            should: [
              { term: { username: "root" } },
              { term: { username: "gazbond" } }
            ]
          }
        })
      )
      .set({
        "X-Sort": JSON.stringify({ updated_at: "desc" })
      });
    // console.log("response: ", response.body);
    // List descending
    response = await chai
      .request(server)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .set({
        "X-Sort": JSON.stringify({ updated_at: "desc" })
      });
    // console.log("response: ", response.body);
  });
});
