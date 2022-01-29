const { selectTopics, selectArticlesById, patchById, fetchArticles, fetchCommentsByArticle, postById, deleteCommentById, selectUsers, selectUserByUsername } = require('../models/app.models')
const endpoints = require('../endpoints.json')

exports.getTopics = (req, res, next) => {
    selectTopics()
    .then((topics) => {
        res.status(200).send({ topics })
    })
    .catch(next)  
}

exports.getArticlesById = (req, res, next) => {
    const { article_id } = req.params
    selectArticlesById(article_id)
    .then((article) => {
        res.status(200).send({ article })
    })
    .catch(next)
}

exports.updateArticleById = (req, res, next) => {
    const { article_id } = req.params;
    const { inc_votes } = req.body;
    patchById(article_id, inc_votes)
    .then((article) => {
        res.status(201).send({ article })
    })
    .catch(next)
}

exports.getArticles = (req, res, next) =>{
    const  { sort_by } = req.query
    const { order } = req.query
    const { topic } = req.query


 fetchArticles(sort_by, order, topic)
 .then((articles) => {
     res.status(200).send({ articles })
 })
 .catch(next)
}

exports.getCommentsByArticle = (req, res, next) => {
    const { article_id } = req.params
    fetchCommentsByArticle(article_id)
    .then((comments) => {
        res.status(200).send({ comments })
    })
    .catch(next)
}

exports.postComment = (req, res, next) => {
    const { article_id } = req.params
    const { username } = req.body
    const { body } = req.body
    postById(article_id, username, body)
    .then((newComment) => {
        res.status(201).send({ newComment })
    })
    .catch(next)
}

exports.deleteComment = (req, res, next) => {
    const { comment_id } = req.params
deleteCommentById(comment_id)
.then((result) => {
    res.status(204).send({})
})
.catch(next)
}

exports.getEndpointsJSON = (req, res, next) => {
    res.status(200).send(endpoints)
}

exports.getUsers = (req, res, next) => {
    selectUsers()
    .then((users) => {
        res.status(200).send ({ users })
    })
}

exports.getUserByUsername = (req, res, next) => {
    const { username } = req.params
    selectUserByUsername(username)
    .then((user) => {
       res.status(200).send({ user })
    })
}