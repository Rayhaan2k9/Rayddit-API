const { selectTopics, selectArticlesById, patchById, fetchArticles, fetchCommentsByArticle } = require('../models/app.models')

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
        console.log(comments)
        res.status(200).send({ comments })
    })
}