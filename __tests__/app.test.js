const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const articles = require("../db/data/test-data/articles");

beforeEach(() => seed(testData));

afterAll(() => {
  db.end();
});

describe("GET /api", () => {
  test("should respond with JSON describing all the available endpoints on this API", () => {
    return request(app)
      .get(`/api`)
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(
          expect.objectContaining({
            "GET /api": expect.any(Object),
            "GET /api/topics": expect.any(Object),
            "GET /api/articles": expect.any(Object),
            "GET /api/articles/:article_id": expect.any(Object),
            "GET /api/articles/:article_id/comments": expect.any(Object),
            "GET /api/users": expect.any(Object),
            "POST /api/articles/:article_id/comments": expect.any(Object),
            "PATCH /api/articles/:article_id": expect.any(Object),
            "DELETE /api/comments/:comment_id": expect.any(Object),
          })
        );
      });
  });
});

describe("GET /api/notARoute", () => {
  test("status:404, responds with an error message if the route does not exist", () => {
    return request(app)
      .get("/api/notARoute")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Route not found");
      });
  });
});

describe("GET /api/topics", () => {
  test("status:200, responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("status:200, responds with an array of all article objects, by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(String),
            })
          );
        });
      });
  });
  test("status:200, articles array should be sorted by the created_at property, in descending order, by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("status:200, should accept a 'topic' query which filters the articles by the value specified", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(11);
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: "mitch",
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(String),
            })
          );
        });
      });
  });
  test("status:200, should return an empty array if topic query exists in the db but contains no related articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(0);
      });
  });
  test("status:404, should respond with an error message if the topic query is valid but does not exist in the db", () => {
    return request(app)
      .get("/api/articles?topic=lee")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Nothing found for topic: lee");
      });
  });
  test("status:200, should accept a 'sort_by' query which sorts the articles by any valid column", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("votes", { descending: true });
      });
  });
  test("status:400. invalid sort_by query", () => {
    return request(app)
      .get("/api/articles?sort_by=stars")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("status: 200, should accept an 'order' query which can be set to asc or desc for ascending or descending", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { ascending: true });
      });
  });
  test("status:400, invalid order query", () => {
    return request(app)
      .get("/api/articles?order=alphabetical")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("status:200, responds with an article object matching the article_id param", () => {
    return request(app)
      .get("/api/articles/9")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual(
          expect.objectContaining({
            article_id: 9,
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            body: expect.any(String),
            comment_count: "2",
          })
        );
      });
  });
  test("status:404, responds with an error message if the article_id is valid but does not exist in the db", () => {
    return request(app)
      .get("/api/articles/73")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No article found for article_id: 73");
      });
  });
  test("status:400, responds with an error message if the article_id is not valid", () => {
    return request(app)
      .get("/api/articles/notAnID")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("status:200, responds with an array of comments related to the article_id param", () => {
    return request(app)
      .get("/api/articles/9/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(2);
        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
            })
          );
        });
      });
  });
  test("status:200, comments should be sorted with the most recent first in the array", () => {
    return request(app)
      .get("/api/articles/9/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeSortedBy("created_at", { ascending: true });
      });
  });
  test("status:200, responds with an empty array if the article_id exists in the db but there are no comments related to it", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(0);
      });
  });
  test("status:404, responds with an error message if the article_id is valid but does not exist in the db", () => {
    return request(app)
      .get("/api/articles/99/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Nothing found for article_id 99");
      });
  });
  test("status:400, responds with an error message if the article_id is not valid", () => {
    return request(app)
      .get("/api/articles/notAnID/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("status:201, should respond with an object containing the posted comment, with all necessary properties", () => {
    const newComment = {
      username: "butter_bridge",
      body: "cool pugs",
    };

    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            body: "cool pugs",
            article_id: 3,
            author: "butter_bridge",
            votes: expect.any(Number),
            created_at: expect.any(String),
          })
        );
      });
  });
  test("status:404, valid but non-existent article id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "nice article",
    };

    return request(app)
      .post("/api/articles/9000/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not found");
      });
  });
  test("status:400, invalid article id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "nice article",
    };

    return request(app)
      .post("/api/articles/notAnID/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("status:404, valid but non-existent username", () => {
    const newComment = {
      username: "captain_crabs",
      body: "nice article",
    };

    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not found");
      });
  });
  test("status:400, missing keys in req body", () => {
    const newComment = {
      username: "butter_bridge",
    };

    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("status:200, should respond with an object containing the updated article after the votes property is incremented correctly", () => {
    const articleUpdate = { inc_votes: 5 };

    return request(app)
      .patch("/api/articles/3")
      .send(articleUpdate)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual(
          expect.objectContaining({
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            created_at: expect.any(String),
            votes: 7,
          })
        );
      });
  });
  test("status:404, valid but non-existent article id", () => {
    const articleUpdate = { inc_votes: 5 };

    return request(app)
      .patch("/api/articles/9000")
      .send(articleUpdate)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Nothing found for article_id 9000");
      });
  });
  test("status:400, invalid article id", () => {
    const articleUpdate = { inc_votes: 5 };

    return request(app)
      .patch("/api/articles/notAnID")
      .send(articleUpdate)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("status:400, missing key from user input", () => {
    const articleUpdate = {};

    return request(app)
      .patch("/api/articles/3")
      .send(articleUpdate)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("status:400, invalid value on key in user input", () => {
    const articleUpdate = { inc_votes: "five" };

    return request(app)
      .patch("/api/articles/3")
      .send(articleUpdate)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("GET /api/users", () => {
  test("status:200, should respond with an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("status:204, should respond with no content after the comment related to the given comment_id is deleted", () => {
    return request(app)
      .delete("/api/comments/3")
      .expect(204)
      .then(() => {
        let SQL = `
          SELECT * 
          FROM comments
          WHERE comment_id = $1;`;

        return db.query(SQL, [3]).then(({ rowCount }) => {
          expect(rowCount).toBe(0);
        });
      });
  });
  test("status:404, valid but non-existent comment_id", () => {
    return request(app)
      .delete("/api/comments/9000")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No comment found for comment_id: 9000");
      });
  });
  test("status:400, invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/three")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});
