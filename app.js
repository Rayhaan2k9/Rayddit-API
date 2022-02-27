const db = require('./db/connection');
const express = require('express')
const app = express();
const cors = require('cors')
const { getTopics, getArticlesById, updateArticleById, getArticles, getCommentsByArticle, postComment, deleteComment, getEndpointsJSON, getUsers, getUserByUsername } = require('./controllers/app.controller')

app.use(cors());
app.use(express.json());

app.get('/api/topics', getTopics)

app.get(`/api/articles/:article_id`, getArticlesById)

app.patch(`/api/articles/:article_id`, updateArticleById);

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments', getCommentsByArticle);

app.post('/api/articles/:article_id/comments', postComment)

app.delete('/api/comments/:comment_id', deleteComment)

app.get('/api', getEndpointsJSON)

app.get('/api/users', getUsers)

app.get('/api/users/:username', getUserByUsername)

app.all('*', (req, res) => {
 res.status(404).send({message: '404: Not found, Please check URL!'})
})

app.use((err, req, res, next) => {
    if (err.status && err.message) {
        res.status(err.status).send({message: err.message})
    }
    else if (err.code === '22P02' || err.code === "23502") {
        res.status(400).send({message: "Bad Request"})
    }
    else res.status(500).send ({message: 'Internal Server Error'})
})

module.exports = app;