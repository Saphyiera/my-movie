const connection = require('../db/connect')
const Movie = require('./Movie')
const Review = require('./Review')

class Episode extends Movie {
    constructor(id,
        title,
        type,
        synopsis,
        releaseYear,
        posterUrl,
        videoUrl,
        rating,
        count,
        seasonid,
        episodenumber,
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
        this.seasonid = seasonid;
        this.episodenumber = episodenumber;
        this.review = new Review();
    }

    getSeasonReview(req, res) {
        this.review.getById(req, res, `
        SELECT 
            s.episodenumber, 
            m.title, 
            m.poster_url, 
            CASE WHEN m.\`count\` > 0 THEN m.rating / m.\`count\` ELSE 0 END AS average_rating
        FROM season s 
        INNER JOIN movie m ON s.episodeid = m.id
        WHERE s.seasonid = ? 
        ORDER BY s.episodenumber
    `, 'Fail to retrieve season review!');
    }

    getSeasonEpisodesDetails(req, res) {
        const { seasonId } = req.query;

        const query = `
            SELECT 
                s.episodeid,
                s.episodenumber, 
                m.synopsis, 
                m.poster_url,
                m.title,
                m.rating, 
                m.\`count\`
            FROM season s 
            INNER JOIN movie m ON s.episodeid = m.id
            WHERE m.\`type\` = 'episode' AND s.seasonid = ?
            ORDER BY s.episodenumber
        `;

        connection.query(query, [seasonId], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            } else {
                res.status(200).json({ data: results });
            }
        });
    }

    getSeasonEpisode(req, res) {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ message: 'Episode ID is required' });
        }

        connection.query(
            `SELECT s.episodeid, s.episodenumber, m.poster_url
            FROM season s
            INNER JOIN movie m ON s.episodeid = m.id
            WHERE s.seasonid = (
                SELECT seasonid FROM season WHERE episodeid = ?    
            )
            ORDER BY s.episodenumber`,
            [id],
            (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                if (result.length === 0) {
                    return res.status(404).json({ message: 'Episodes not found' });
                }

                res.json(result);
            }
        );
    }

    getNextEpisode(req, res) {
        const { id } = req.query;

        connection.query(`
            SELECT episodeid AS nextepisodeid
            FROM season
            WHERE seasonid = (
                SELECT seasonid
                FROM season
                WHERE episodeid = ?
            )
            AND episodenumber = (
                SELECT MIN(episodenumber)
                FROM season
                WHERE seasonid = (
                    SELECT seasonid
                    FROM season
                    WHERE episodeid = ?
                )
                AND episodenumber > (
                    SELECT episodenumber
                    FROM season
                    WHERE episodeid = ?
                )
            );
        `, [id, id, id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'No next episode found' });
            }

            res.json(results[0]);
        });
    }

    getPreviousEpisode(req, res) {
        const { id } = req.query;

        connection.query(`
            SELECT episodeid AS previousepisodeid
            FROM season
            WHERE seasonid = (
                SELECT seasonid
                FROM season
                WHERE episodeid = ?
            )
            AND episodenumber = (
                SELECT MAX(episodenumber)
                FROM season
                WHERE seasonid = (
                    SELECT seasonid
                    FROM season
                    WHERE episodeid = ?
                )
                AND episodenumber < (
                    SELECT episodenumber
                    FROM season
                    WHERE episodeid = ?
                )
            )
        `, [id, id, id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'No previous episode found' });
            }

            res.json(results[0]);
        });
    }


}

module.exports = Episode