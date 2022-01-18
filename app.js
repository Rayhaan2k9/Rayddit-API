const db = require('./db/connection');
const express = require('express')
const app = express();
const { getTopics } = require('./controllers/app.controller')


app.use(express.json());

app.get('/api/topics', getTopics)

app.all('*', (req, res) => {
 res.status(404).send({message: 'Not found!'})
})

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send ({message: 'Internal Server Error'})
})

module.exports = app;