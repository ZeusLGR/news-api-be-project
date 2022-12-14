const {
  displayEndpoints,
  selectTopics,
  selectArticles,
  selectArticleByID,
  selectCommentsByArticleID,
  checkIfArticleIDExists,
  postCommentModel,
  checkIfTopicExists,
  patchArticleVotesModel,
  selectUsers,
  deleteCommentModel,
  checkCommentExists,
} = require("../models/models");

exports.checkEndpoints = (req, res) => {
  displayEndpoints().then((endpoints) => {
    res.status(200).send({ endpoints });
  });
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
  const { topic, sort_by, order } = req.query;
  const promises = [
    selectArticles(topic, sort_by, order),
    checkIfTopicExists(topic),
  ];
  Promise.all(promises)
    .then(([articles]) => {
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

exports.patchArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const articleUpdate = req.body;

  patchArticleVotesModel(article_id, articleUpdate)
    .then((article) => {
      res.status(200).send({ article });
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

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  const promises = [
    checkCommentExists(comment_id),
    deleteCommentModel(comment_id),
  ];
  Promise.all(promises)
    .then(() => {
      return res.status(204).send({});
    })
    .catch((err) => {
      next(err);
    });
};
