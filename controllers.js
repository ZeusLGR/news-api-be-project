const { selectTopics } = require("./models");

exports.checkAPI = (req, res) => {
    res.status(200).send({ message: "all ok" });
  };

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      console.log(topics);
      return res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};
