const {
  selectTopics,
  selectArticles,
  selectArticleByID,
  selectCommentsByArticleID,
  checkIfArticleIDExists,
  postCommentModel,
  selectUsers,
} = require("../models/models");

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

exports.getArticleByID = (req, res, next) => {
  const { article_id } = req.params;

  selectArticleByID(article_id)
    .then((article) => {
      return res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsByArticleID = (req, res, next) => {
  const { article_id } = req.params;
  const promises = [
    selectCommentsByArticleID(article_id),
    checkIfArticleIDExists(article_id),
  ];
  Promise.all(promises)
    .then(([comments]) => {
      return res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const newComment = req.body;

  postCommentModel(article_id, newComment)
    .then((comment) => {
      return res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then((users) => {
      return res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};
