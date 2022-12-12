const db = require("../db/connection");

exports.selectTopics = () => {
  let SQL = `
    SELECT *
    FROM topics`;

  return db.query(SQL).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticles = () => {
  let SQL = `
  SELECT *
  FROM articles`;

  return db.query(SQL).then(({ rows }) => {
    rowsToSend = rows.map((article) => {
      const { body, ...rest } = article;
      return rest;
    });
    return rowsToSend;
  });
};
