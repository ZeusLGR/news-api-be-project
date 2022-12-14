const express = require("express");
const cors = require("cors");
const {
  checkEndpoints,
  getTopics,
  getArticles,
  getArticleByID,
  getCommentsByArticleID,
  postComment,
  patchArticleVotes,
  getUsers,
  deleteComment,
} = require("./controllers/controllers");
const {
  routeNotFound,
  handleServerErrors,
  handleCustomErrors,
  handlePsqlErrors,
} = require("./controllers/errors.controllers");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", checkEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleByID);
app.get("/api/articles/:article_id/comments", getCommentsByArticleID);
app.get("/api/users", getUsers);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", patchArticleVotes);

app.delete("/api/comments/:comment_id", deleteComment);

app.all("*", routeNotFound);

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;
