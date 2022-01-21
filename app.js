const db = require('./db/connection');
const express = require('express')
const app = express();
const { getTopics, getArticlesById, updateArticleById, getArticles, getCommentsByArticle, postComment } = require('./controllers/app.controller')


app.use(express.json());

app.get('/api/topics', getTopics)

app.get(`/api/articles/:article_id`, getArticlesById)

app.patch(`/api/articles/:article_id`, updateArticleById);

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments', getCommentsByArticle);

app.post('/api/articles/:article_id/comments', postComment)

app.all('*', (req, res) => {
 res.status(404).send({message: 'Not found!'})
})

app.use((err, req, res, next) => {
    console.log(err)
    if (err.status && err.message) {
        res.status(err.status).send({message: err.message})
    }
    else if (err.code === '22P02' || err.code === "23502") {
        res.status(400).send({message: "Bad Request"})
    }
    else res.status(500).send ({message: 'Internal Server Error'})
})

module.exports = app;