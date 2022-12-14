const express = require("express");
const {
  checkAPI,
  getTopics,
  getArticles,
  getArticleByID,
  getCommentsByArticleID,
} = require("./controllers/controllers");
const {
  routeNotFound,
  handleServerErrors,
  handleCustomErrors,
  handlePsqlErrors,
} = require("./controllers/errors.controllers");

const app = express();

app.get("/api", checkAPI);
app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleByID);
app.get("/api/articles/:article_id/comments", getCommentsByArticleID);

app.use(handleCustomErrors);
app.use(handlePsqlErrors);

app.all("*", routeNotFound);

app.use(handleServerErrors);

module.exports = app;
