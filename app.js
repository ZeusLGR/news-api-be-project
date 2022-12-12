const express = require("express");
const { checkAPI, getTopics, getArticles } = require("./controllers/controllers");
const {
  routeNotFound,
  internalServerError,
} = require("./controllers/errors.controllers");

const app = express();

app.get("/api", checkAPI);
app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles)

app.all("*", routeNotFound);

app.use(internalServerError);

module.exports = app;
