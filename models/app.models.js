const db = require('../db/connection')

exports.selectTopics = () => {
    return db.query('SELECT * FROM topics')
    .then((topics) => {
        return topics.rows
    })
}

exports.selectArticlesById = (id) => {
    return db.query(`SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes,COUNT(comments.body)::INT AS comment_count FROM articles 
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1 
    GROUP BY articles.article_id`, [ id ])
    .then((result) => {
        const article = result.rows[0]
        if(!article) {
            return Promise.reject({
                status: 404,
                message: `No article found for article_id: ${id}`
            })
        }
        return article
    })
    
}

exports.patchById = (id, votes) => {
    return db.query(`UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`, [votes, id])
    .then((result) => {
        return result.rows[0]
    })
}