const express = require("express");
const {
  checkAPI,
  getTopics,
  getArticles,
  getArticleByID,
  getCommentsByArticleID,
  postComment,
} = require("./controllers/controllers");
const {
  routeNotFound,
  handleServerErrors,
  handleCustomErrors,
  handlePsqlErrors,
} = require("./controllers/errors.controllers");

const app = express();

app.use(express.json());

app.get("/api", checkAPI);
app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleByID);
app.get("/api/articles/:article_id/comments", getCommentsByArticleID);

app.post("/api/articles/:article_id/comments", postComment);

app.all("*", routeNotFound);

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;
