const { selectTopics, selectArticles } = require("../models/models");

exports.checkAPI = (req, res) => {
  res.status(200).send({ msg: "all ok" });
};

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      return res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  selectArticles()
    .then((articles) => {
      return res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};
