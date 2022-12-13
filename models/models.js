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
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC`;

  return db.query(SQL).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleByID = (article_id) => {
  let SQL = `
    SELECT * 
    FROM articles
    WHERE article_id = $1;`;

  return db.query(SQL, [article_id]).then(({ rows }) => {
    const article = rows[0];

    if (!article) {
      return Promise.reject({
        status: 404,
        msg: `No article found for article_id: ${article_id}`,
      });
    }
    return article;
  });
};
