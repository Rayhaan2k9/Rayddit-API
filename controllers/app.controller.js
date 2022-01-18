const { selectTopics, selectArticlesById } = require('../models/app.models')

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
}