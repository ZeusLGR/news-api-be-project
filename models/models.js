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
  SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, COUNT(*) AS comment_count
  FROM articles
  LEFT OUTER JOIN comments 
  ON comments.article_id = articles.article_id
  GROUP BY articles.article_id`;

  return db.query(SQL).then(({ rows }) => {
    return rows;
  });
};
