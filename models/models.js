const db = require("../db/connection");

exports.selectTopics = () => {
  let SQL = `
    SELECT *
    FROM topics`;

  return db.query(SQL).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticles = (topic, sort_by = "created_at", order = "desc") => {
  const validSortBy = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrder = ["asc", "desc"];
  const queryValues = [];

  let SQL = `
    SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, COUNT(*) AS comment_count
    FROM articles
    LEFT OUTER JOIN comments 
    ON comments.article_id = articles.article_id
    `;

  if (topic) {
    queryValues.push(topic);
    SQL += `WHERE topic = $1 `;
  }

  SQL += ` 
    GROUP BY articles.article_id
    `;

  if (!validSortBy.includes(sort_by) || !validOrder.includes(order)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  } else {
    SQL += `ORDER BY articles.${sort_by} ${order}`;
  }

  return db.query(SQL, queryValues).then(({ rows }) => {
    return rows;
  });
};

exports.checkIfTopicExists = (topic) => {
  if (topic === undefined) {
    return true;
  }

  const SQL = `
    SELECT *
    FROM topics
    WHERE slug = $1;`;

  return db.query(SQL, [topic]).then(({ rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: `Nothing found for topic: ${topic}`,
      });
    } else {
      return true;
    }
  });
};

exports.selectArticleByID = (article_id) => {
  let SQL = `
    SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.body, COUNT(*) AS comment_count
    FROM articles
    LEFT OUTER JOIN comments 
    ON comments.article_id = articles.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;`;

  return db.query(SQL, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: `No article found for article_id: ${article_id}`,
      });
    }
    return rows[0];
  });
};

exports.selectCommentsByArticleID = (article_id) => {
  let SQL = `
    SELECT *
    FROM comments
    WHERE article_id = $1
    GROUP BY comment_id
    ORDER BY created_at 
  `;

  return db.query(SQL, [article_id]).then(({ rows }) => {
    return rows;
  });
};

exports.checkIfArticleIDExists = (article_id) => {
  const SQL = `
    SELECT *
    FROM articles
    WHERE article_id = $1;`;

  return db.query(SQL, [article_id]).then(({ rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: `Nothing found for article_id ${article_id}`,
      });
    } else {
      return true;
    }
  });
};

exports.postCommentModel = (article_id, newComment) => {
  const { username, body } = newComment;
  const queryValues = [body, article_id, username];

  let SQL = `
    INSERT INTO comments (body, article_id, author) 
    VALUES ($1, $2, $3) 
    RETURNING *;`;

  return db.query(SQL, queryValues).then(({ rows }) => {
    return rows[0];
  });
};

exports.patchArticleVotesModel = (article_id, articleUpdate) => {
  const { inc_votes } = articleUpdate;

  const queryValues = [inc_votes, article_id];

  let SQL = `
    UPDATE articles 
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;`;

  return db.query(SQL, queryValues).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: `Nothing found for article_id ${article_id}`,
      });
    }
    return rows[0];
  });
};

exports.selectUsers = () => {
  let SQL = `
    SELECT * 
    FROM users`;

  return db.query(SQL).then(({ rows }) => {
    return rows;
  });
};

exports.deleteCommentModel = (comment_id) => {
  const SQL = `
    DELETE FROM comments
    WHERE comment_id = $1;`;

  return db.query(SQL, [comment_id]).then(() => {});
};

exports.checkCommentExists = (comment_id) => {
  const SQL = `
    SELECT * 
    FROM comments
    WHERE comment_id = $1;`;

  return db.query(SQL, [comment_id]).then(({ rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: `No comment found for comment_id: ${comment_id}`,
      });
    } else {
      return true;
    }
  });
};
