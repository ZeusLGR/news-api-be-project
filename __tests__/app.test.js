const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

beforeEach(() => seed(testData));

afterAll(() => {
  db.end();
});

describe("GET /api", () => {
  test("should return an object containing a message key", () => {
    return request(app)
      .get(`/api`)
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({ msg: "all ok" });
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
        expect(topics).toBeInstanceOf(Array);
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
  test("status:200, responds with an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeInstanceOf(Array);
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
  test("status:200, articles array should be sorted by the created_at property, in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("status:200, responds with an article object matching the article_id param", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toEqual(
          expect.objectContaining({
            article_id: 2,
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            body: expect.any(String),
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
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeInstanceOf(Array);
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
        expect(comment).toEqual({
          comment_id: expect.any(Number),
          body: "cool pugs",
          article_id: 3,
          author: "butter_bridge",
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
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
        expect(article).toEqual({
          article_id: 3,
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          author: "icellusedkars",
          body: "some gifs",
          created_at: expect.any(String),
          votes: 7,
        });
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
