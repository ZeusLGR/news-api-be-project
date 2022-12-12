const db = require("../db/connection");

exports.selectTopics = () => {
  let SQL = `
    SELECT *
    FROM topics`;

  return db.query(SQL).then(({ rows }) => {
    return rows;
  });
};
