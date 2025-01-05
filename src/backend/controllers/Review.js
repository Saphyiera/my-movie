const connection = require('../db/connect')
const Base = require('./Base')

class Review extends Base {
    constructor(id, index, title, poster, rating) {
        super(id);
        this.index = index;
        this.title = title;
        this.poster = poster;
        this.rating = rating;
    }

    getById(req, res, query, message) {
        const { id } = req.query;

        connection.query(query, [id], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: message });
            } else {
                res.status(200).json({ data: results });
            }
        });
    }
}

module.exports = Review