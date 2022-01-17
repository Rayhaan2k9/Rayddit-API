const { selectTopics } = require('../models/app.models')

exports.getTopics = (req, res, next) => {
    console.log('in the controller')
    selectTopics()
    
    
}