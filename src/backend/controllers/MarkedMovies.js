const connection = require('../db/connect')
const Movie = require('./Movie')

class MarkedMovies extends Movie {
    constructor(id,
        title,
        type,
        synopsis,
        releaseYear,
        posterUrl,
        videoUrl,
        rating,
        count,
        userid
    ) {
        super(id,
            title,
            type,
            synopsis,
            releaseYear,
            posterUrl,
            videoUrl,
            rating,
            count);
        this.userid = userid
    }

    getUserMarkedMovies(req, res) {
        const { userId } = req.query;

        connection.query(`SELECT m.id, m.title, m.poster_url
            FROM marked_movie mm 
            INNER JOIN movie m
            ON mm.movieid = m.id
            WHERE mm.userid = ?
            `, [userId], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            } else {
                res.status(200).json({ data: results });
            }
        })
    }

    markMovie(req, res) {
        const { userId, movieId } = req.body;

        connection.query(`INSERT INTO marked_movie(movieid,userid) VALUES(?,?) ON DUPLICATE KEY UPDATE movieid = VALUES(movieid)`, [movieId, userId], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            } else {
                res.status(200).json({ data: results, message: "Successfully marked movie to watch later!" });
            }
        })
    }

    unmarkMovie(req, res) {
        const { userId, movieId } = req.body;

        connection.query(`DELETE FROM marked_movie WHERE movieid = ? AND userid = ?`, [movieId, userId], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            } else {
                res.status(200).json({ data: results, message: "Movie removed from your marked movies!" });
            }
        })
    }
}

module.exports = MarkedMovies