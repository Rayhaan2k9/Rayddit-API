const { query } = require('../db/connection')
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
exports.checkTopicExists = (topic) => {
    const dbOutput = `SELECT * FROM articles WHERE topic = $1;`
    return db.query(dbOutput, [topic])
    .then((result) => {
        console.log(result.rows)
        
    })  
}

exports.fetchArticles = (sort_by = 'created_at', order = 'DESC', topic) => {
   const allowedSortBys = [
       'author',
       'title',
       'article_id',
       'body',
       'topic',
       'created_at',
       'votes',
       'comment_count'
]

const allowedOrders = [
    'ASC',
    'DESC'
]




if(!allowedSortBys.includes(sort_by)) {
    return Promise.reject({status: 400, message: "Invalid sort query"})
}

if(!allowedOrders.includes(order)) {
    return Promise.reject({status: 400, message: 'Invalid order query'})
}


    let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes,COUNT(comments.body)::INT AS comment_count FROM articles 
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id`

    if(topic) {
        queryStr += ` WHERE articles.topic = $1 GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order}`
        return db.query(queryStr, [topic])
        .then((result) => {
            if (result.rows.length === 0) {
                return Promise.reject({status: 404, message: 'Topic not found'})
            }
            return result.rows
        })
}

   else { return db.query(`SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes,COUNT(comments.body)::INT AS comment_count FROM articles 
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order}`)
    .then((result) => {
        return result.rows
    })
}
    
}