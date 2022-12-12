const express = require("express");
const { checkAPI, getTopics } = require("./controllers");
const { routeNotFound } = require("./errors.controllers");

const app = express();

app.get("/api", checkAPI);
app.get("/api/topics", getTopics);

app.all("*", routeNotFound);

module.exports = app;
