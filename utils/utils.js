const db = require('../db/connection')


function getCount(id) {
    return db.query(`SELECT COUNT(*)::INT FROM comments WHERE article_id = $1;`, [id])
    .then((result) => {
        console.log(result.rows[0].count)
    })
}
module.exports = getCount