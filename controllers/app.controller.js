const { selectTopics, selectArticlesById, patchById, fetchArticles } = require('../models/app.models')

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
 fetchArticles(sort_by)
 .then((articles) => {
     res.status(200).send({ articles })
 })
}