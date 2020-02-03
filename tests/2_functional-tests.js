/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");
const { expect } = require("chai");

chai.use(chaiHttp);

suite("Functional Tests", function() {
  suite("API ROUTING FOR /api/threads/:board", function() {
    suite("POST", function() {
      test("POST board", done => {
        chai
          .request(server)
          .post("/api/threads/a")
          .send({
            text: "This is text for post",
            delete_password: "pass"
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            expect(res).to.redirect;
          });
        done();
      });
      test("Failed POST board", done => {
        chai
          .request(server)
          .post("/api/threads/a")
          .send({
            text: "This is text for post"
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "Invalid input");
          });
        done();
      });
    });

    suite("GET", function() {
      test("GET board", done => {
        chai
          .request(server)
          .get("/api/threads/a")

          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isAtMost(res.body.length, 10);
            assert.isAtMost(res.body[0].replies.length, 3);
          });
        done();
      });
      test("GET board bad board name", done => {
        chai
          .request(server)
          .get("/api/threads/gdgdgdfgdfgdf")
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.equal(res.body.length, 0);
          });
        done();
      });
    });

    suite("DELETE", function() {
      let id;
      test("DELETE ID", done => {
        chai
          .request(server)
          .get("/api/threads/a")
          .end((err, res) => {
            assert.equal(res.status, 200);
            id = res.body[0]._id;
            chai
              .request(server)
              .delete("/api/threads/a")
              .send({
                thread_id: id,
                delete_password: "pass"
              })
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, "success");
              });
          });
        done();
      });
      const badId = "5e376b618c06ea390f123456";

      test("DELETE ID fail", done => {
        chai
          .request(server)
          .delete("/api/threads/a")
          .send({
            thread_id: badId,
            delete_password: "pass"
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "Cant find thread with given id");
          });
        done();
      });
    });

    suite("PUT", function() {
      let id;
      test("report thread", done => {
        chai
          .request(server)
          .get("/api/threads/a")
          .end((err, res) => {
            assert.equal(res.status, 200);
            id = res.body[0]._id;
            chai
              .request(server)
              .put("/api/threads/a")
              .send({
                thread_id: id
              })
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, "reported");
              });
          });
        done();
      });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", function() {
    let id;
    const badId = "5e376b618c06ea390f123456";
    let id2;

    suite("POST", function() {
      test("POST reply", done => {
        chai
          .request(server)
          .get("/api/threads/a")
          .end((err, res) => {
            assert.equal(res.status, 200);
            id = res.body[0]._id;
            chai
              .request(server)
              .post("/api/replies/a")
              .send({
                text: "This is text for post",
                delete_password: "pass",
                thread_id: id
              })
              .end((err, res) => {
                assert.equal(res.status, 200);                
              });
          });
        done();
      });
      test("Failed POST reply", done => {
        chai
          .request(server)
          .post("/api/replies/a")
          .send({
            delete_password: "pass",
            thread_id: id
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "Invalid input");
          });
        done();
      });
    });

    suite("GET", function() {
      test("GET reply", done => {
        chai
          .request(server)
          .get("/api/threads/a")
          .end((err, res) => {
            assert.equal(res.status, 200);
            id = res.body[0]._id;
            chai
              .request(server)
              .get("/api/replies/a")
              .query({ thread_id: id })
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.property(res.body, "_id");
                assert.property(res.body, "text");
                assert.property(res.body, "created_on");
                assert.property(res.body, "bumped_on");
                assert.property(res.body, "replies");
              });
          });
        done();
      });

      test("GET reply bad id", done => {
        chai
          .request(server)
          .get("/api/replies/a")
          .query({ thread_id: badId })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "Cant find thread with given id");
          });
        done();
      });

      test("GET reply bad input", done => {
        chai
          .request(server)
          .get("/api/replies/a")
          .query()
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "Invalid input");
          });
        done();
      });
    });

    suite("PUT", function() {
      test("report thread", done => {
        chai
          .request(server)
          .get("/api/threads/general")
          .end((err, res) => {
            assert.equal(res.status, 200);
            const arr = res.body.filter(x => x.replies.length > 0);
            id = arr[0]._id;
            id2 = arr[0].replies[0]._id;

            chai
              .request(server)
              .put("/api/replies/general")
              .send({
                thread_id: id,
                reply_id: id2
              })
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, "reported");
              });
          });
        done();
      });
    });

    suite("DELETE", function() {
      test("DELETE reply", done => {
        chai
          .request(server)
          .get("/api/threads/general")
          .end((err, res) => {
            assert.equal(res.status, 200);

            chai
              .request(server)
              .delete("/api/replies/general")
              .send({
                thread_id: id,
                reply_id: id2,
                delete_password: "pass"
              })
              .end((err, res) => {
                assert.equal(res.status, 200);              
                assert.equal(res.text, "success");
              });
          });
        done();
      });
    });
  });
});
