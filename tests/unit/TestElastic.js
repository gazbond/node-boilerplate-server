const expect = require("expect.js");

// ElasticSearch.
const { elastic } = require("../../config");

// Models.
const User = require("../../models/User");

describe("Test ElasticSearch", function() {
  it("tests using elasticsearch.js directly", async function() {
    // tests creating an ElasticSearch index
    await elastic.indices.create({ index: "test-index" });
    // No actual assertions here
    // tests creating an ElasticSearch type
    await elastic.indices.putMapping({
      index: "test-index",
      // Define 'type' twice, here and in body
      type: "test",
      body: {
        test: {
          dynamic: "strict",
          properties: {
            id: {
              type: "long"
            },
            text: {
              type: "text"
            }
          }
        }
      }
    });
    // No actual assertions here
    // tests storing data in an ElasticSearch index
    await elastic.index({
      index: "test-index",
      type: "test",
      id: 1,
      body: {
        id: 1,
        text: "testing1"
      },
      refresh: true
    });
    await elastic.index({
      index: "test-index",
      type: "test",
      id: 2,
      body: {
        id: 2,
        text: "testing2"
      },
      refresh: true
    });
    await elastic.index({
      index: "test-index",
      type: "test",
      id: 3,
      body: {
        id: 3,
        text: "testing3"
      },
      refresh: true
    });
    // tests updating data in an ElasticSearch index
    await elastic.update({
      index: "test-index",
      type: "test",
      id: 1,
      body: {
        doc: {
          text: "testing11"
        }
      },
      refresh: true
    });
    // No actual assertions here
    // tests searching an ElasticSearch index
    let results = await elastic.search({
      index: "test-index",
      // type: "test",
      body: {
        query: {
          match_all: {}
        }
      },
      pretty: true,
      size: 1000
    });
    expect(results.statusCode).to.eql(200);
    let data = results.body.hits.hits;
    expect(data).to.be.an(Array);
    expect(data).to.have.length(3);
    results = await elastic.search({
      index: "test-index",
      body: {
        query: {
          match: {
            text: "testing11"
          }
        }
      },
      pretty: true,
      size: 1000
    });
    expect(results.statusCode).to.eql(200);
    data = results.body.hits.hits;
    expect(data).to.be.an(Array);
    expect(data).to.have.length(1);
    // tests reading an ElasticSearch index by id
    let result = await elastic.get({
      id: 1,
      index: "test-index",
      type: "test"
    });
    expect(result.statusCode).to.eql(200);
    expect(result.body).to.be.an(Object);
    expect(result.body._id).to.eql(1);
    expect(result.body._source).to.be.an(Object);
    expect(result.body._source.id).to.eql(1);
    expect(result.body._source.text).to.eql("testing11");
    // tests deleting data in an ElasticSearch index
    result = await elastic.delete({
      id: 1,
      index: "test-index",
      type: "test"
    });
    expect(result.statusCode).to.eql(200);
    // tests deleting an ElasticSearch index
    await elastic.indices.delete({ index: "test-index" });
    // No actual assertions here
  });
  it("tests storing/updating models updates ElasticSearch index", async function() {
    let user = await User.query().insertAndFetch({
      status: "active",
      username: "gazBb",
      email: "test@gazbond.co.uk",
      password: "Password1",
      confirmed_at: new Date().toISOString()
    });
    let results = await elastic.search({
      index: User.indexName,
      type: User.indexType,
      body: {
        query: {
          match: {
            username: "gazBb"
          }
        }
      },
      pretty: true,
      size: 1000
    });
    expect(results.statusCode).to.eql(200);
    let data = results.body.hits.hits;
    expect(data).to.be.an(Array);
    expect(data).to.have.length(1);
    await user.$query().patchAndFetch({
      email: "test1@gazbond.co.uk"
    });
    results = await elastic.search({
      index: User.indexName,
      type: User.indexType,
      body: {
        query: {
          match: {
            username: "gazBb"
          }
        }
      },
      pretty: true,
      size: 1000
    });
    expect(results.statusCode).to.eql(200);
    data = results.body.hits.hits;
    expect(data).to.be.an(Array);
    expect(data).to.have.length(1);
    let result = data[0];
    expect(result).to.be.an(Object);
    expect(result._id).to.eql(user.id);
    expect(result._source).to.be.an(Object);
    expect(result._source.email).to.eql("test1@gazbond.co.uk");
  });
  it("tests deleting models updates ElasticSearch index", async function() {
    let user = await User.query().insertAndFetch({
      status: "active",
      username: "gazBb",
      email: "test@gazbond.co.uk",
      password: "Password1",
      confirmed_at: new Date().toISOString()
    });
    let results = await elastic.search({
      index: User.indexName,
      type: User.indexType,
      body: {
        query: {
          match: {
            username: "gazBb"
          }
        }
      },
      pretty: true,
      size: 1000
    });
    expect(results.statusCode).to.eql(200);
    let data = results.body.hits.hits;
    expect(data).to.be.an(Array);
    expect(data).to.have.length(1);
    await user.$query().delete();
    results = await elastic.search({
      index: User.indexName,
      type: User.indexType,
      body: {
        query: {
          match: {
            username: "gazBb"
          }
        }
      },
      pretty: true,
      size: 1000
    });
    expect(results.statusCode).to.eql(200);
    data = results.body.hits.hits;
    expect(data).to.be.an(Array);
    expect(data).to.have.length(0);
  });
});
