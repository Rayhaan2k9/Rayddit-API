const { query } = require("../db/connection");
const db = require("../db/connection");
const endpoints = require("../endpoints.json");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics").then((topics) => {
    return topics.rows;
  });
};

exports.selectArticlesById = (id) => {
  return db
    .query(
      `SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes,COUNT(comments.body)::INT AS comment_count FROM articles 
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1 
    GROUP BY articles.article_id`,
      [id]
    )
    .then((result) => {
      const article = result.rows[0];
      if (!article) {
        return Promise.reject({
          status: 404,
          message: `No article found for article_id: ${id}`,
        });
      } 
      return article;
    });
};

exports.patchById = (id, votes) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`,
      [votes, id]
    )
    .then((result) => {
      const article = result.rows[0];
      if (!article) {
        return Promise.reject({
          status: 404,
          message: `No article found for article_id: ${id}`,
        });
      } 
      return article;
    });
};
exports.checkTopicExists = (topic) => {
  const dbOutput = `SELECT * FROM articles WHERE topic = $1;`;
  return db.query(dbOutput, [topic]).then((result) => {
    console.log(result.rows);
  });
};

exports.fetchArticles = (sort_by = "created_at", order = "DESC", topic) => {
  const allowedSortBys = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];

  const allowedOrders = ["ASC", "DESC"];

  if (!allowedSortBys.includes(sort_by)) {
    return Promise.reject({ status: 400, message: "Invalid sort query" });
  }

  if (!allowedOrders.includes(order)) {
    return Promise.reject({ status: 400, message: "Invalid order query" });
  }

  let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes,COUNT(comments.body)::INT AS comment_count FROM articles 
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id`;

  if (topic) {
    queryStr += ` WHERE articles.topic = $1 GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order}`;
    return db.query(queryStr, [topic]).then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, message: "Topic not found" });
      }
      return result.rows;
    });
  } else {
    return db
      .query(
        `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes,COUNT(comments.body)::INT AS comment_count FROM articles 
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order}`
      )
      .then((result) => {
        return result.rows;
      });
  }
};

exports.fetchCommentsByArticle = (article_id) => {
  const regex = /\d/g;
  if (regex.test(article_id) === false) {
    return Promise.reject({
      status: 400,
      message: "Bad request, please enter a valid number",
    });
  }
  const noOfArticles = [];

  return db
    .query(`SELECT articles.article_id FROM articles`)
    .then((result) => {
      noOfArticles.push(result.rows.length);
    })
    .then(() => {
      return db.query(
        `SELECT comments.comment_id, comments.votes, comments.created_at, users.username AS author, comments.body FROM comments INNER JOIN articles ON comments.article_id = articles.article_id INNER JOIN users ON comments.author = users.username
    WHERE articles.article_id = $1`,
        [article_id]
      );
    })

    .then((result) => {
      if (parseInt(article_id) <= noOfArticles[0]) {
        return Promise.resolve(result.rows);
      }

      if (parseInt(article_id) > noOfArticles[0]) {
        return Promise.reject({
          status: 404,
          message: `No article found for article_id: ${article_id}`,
        });
      }

      return result.rows;
    });
};

exports.postById = (article_id, username, body) => {
  const regex = /\d/g;
  if (regex.test(article_id) === false) {
    return Promise.reject({
      status: 400,
      message: "Please enter a valid article_id",
    });
  }

  if (typeof username !== "string" || typeof body !== "string") {
    return Promise.reject({
      status: 400,
      message: "Incorrect datatype for post request",
    });
  }
  const usersList = [];
  return db
    .query(`SELECT username FROM users`)
    .then((users) => {
      users.rows.forEach((user) => {
        usersList.push(user.username);
      });
      if (!usersList.includes(username)) {
        return Promise.reject({
          status: 404,
          message: "User does not exist",
        });
      }
    })
    .then(() => {
      return db
        .query(`SELECT * FROM articles WHERE article_id = ${article_id}`)
        .then((articles) => {
          if (articles.rows.length === 0) {
            return Promise.reject({
              status: 404,
              message: `No article found for article_id: ${article_id}`,
            });
          }
        });
    })

    .then(() => {
      return db.query(
        `INSERT INTO comments (votes, author, body, article_id)
    VALUES (0, $1, $2, $3) RETURNING comment_id, votes, created_at, author, body`,
        [username, body, article_id]
      );
    })

    .then((result) => {
      return result.rows[0];
    });
};

exports.deleteCommentById = (comment_id) => {
  const regex = /\d/g;
  if (regex.test(comment_id) === false) {
    return Promise.reject({
      status: 400,
      message: "Please enter a valid comment_id",
    });
  }

  return db
    .query(`SELECT * FROM comments WHERE comment_id = ${comment_id}`)
    .then((comments) => {
      if (comments.rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: `No comment found for comment_id: ${comment_id}`,
        });
      }
    })
    .then(() => {
      return db.query(`DELETE FROM comments WHERE comment_id = $1`, [
        comment_id,
      ]);
    });
};

exports.selectUsers = () => {
  return db.query(`SELECT username, avatar_url, name FROM users`).then((users) => {
    return users.rows;
  });
};

exports.selectUserByUsername = (username) => {
  const usersList = [];
  return db
    .query(`SELECT username FROM users`)
    .then((users) => {
      users.rows.forEach((user) => {
        usersList.push(user.username);
      });
      if (!usersList.includes(username)) {
        return Promise.reject({
          status: 404,
          message: "User does not exist",
        });
      }
    })
    .then(() => {
      return db
        .query(`SELECT * FROM users WHERE username = $1`, [username])
        .then((users) => {
          return users.rows[0];
        });
    });
};
