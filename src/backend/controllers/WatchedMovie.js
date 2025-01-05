const connection = require('../db/connect')
const Movie = require('./Movie')

class WatchedMovies extends Movie {
    constructor(id,
        title,
        type,
        synopsis,
        releaseYear,
        posterUrl,
        videoUrl,
        rating,
        count,
        userid,
        timewatch
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
        this.userid = userid;
        this.timewatch = timewatch;
    }

    insertWatchedMovie(req, res) {
        const { movieId, userId } = req.body;

        connection.query(
            `INSERT INTO watched_movie(movieid, userid, timewatch) 
             VALUES(?, ?, CURRENT_TIMESTAMP) 
             ON DUPLICATE KEY UPDATE timewatch = CURRENT_TIMESTAMP`,
            [movieId, userId],
            (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    res.status(200).json({ data: result });
                }
            }
        );
    }

    getUserWatchedMovies(req, res) {
        const { userId, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        connection.query(
            `SELECT COUNT(*) AS total 
             FROM watched_movie wm 
             WHERE wm.userid = ?`,
            [userId],
            (countErr, countResult) => {
                if (countErr) {
                    console.error(countErr);
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    const totalMovies = countResult[0].total;
                    const totalPages = Math.ceil(totalMovies / limit);

                    connection.query(
                        `SELECT m.id, m.title, m.poster_url 
                         FROM movie m 
                         INNER JOIN watched_movie wm ON m.id = wm.movieid 
                         WHERE wm.userid = ? 
                         LIMIT ? OFFSET ?`,
                        [userId, parseInt(limit), parseInt(offset)],
                        (err, result) => {
                            if (err) {
                                console.error(err);
                                res.status(500).json({ message: 'Internal server error' });
                            } else {
                                res.status(200).json({
                                    data: result,
                                    totalMovies,
                                    totalPages,
                                    currentPage: parseInt(page),
                                });
                            }
                        }
                    );
                }
            }
        );
    }
}

module.exports = WatchedMovies