const connection = require('../db/connect')
const Movie = require('./Movie')
const Review = require('./Review')

class Season extends Movie {
    constructor(id,
        title,
        type,
        synopsis,
        releaseYear,
        posterUrl,
        videoUrl,
        rating,
        count,
        serieid,
        seasonnumber,
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
        this.serieid = serieid;
        this.seasonnumber = seasonnumber;
        this.review = new Review();
    }

    getShowSeasons(req, res) {
        const { serieId } = req.query;

        const query = `
            SELECT 
                s.seasonid,
                s.seasonnumber, 
                s.seasontitle,
                m.synopsis, 
                m.release_year, 
                m.poster_url, 
                m.rating, 
                m.\`count\`
            FROM serie s 
            INNER JOIN movie m ON s.seasonid = m.id
            WHERE m.\`type\` = 'season' AND s.serieId = ?
            ORDER BY s.seasonnumber
        `;

        connection.query(query, [serieId], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            } else {
                res.status(200).json({ data: results });
            }
        });
    }

    getShowReview(req, res) {
        this.review.getById(req, res, `
            SELECT 
                s.seasonnumber, 
                s.seasontitle, 
                m.poster_url, 
                m.\`count\`,
                CASE WHEN m.\`count\` > 0 THEN m.rating / m.\`count\` ELSE 0 END AS average_rating
            FROM serie s 
            INNER JOIN movie m ON s.seasonid = m.id
            WHERE s.serieid = ? 
            ORDER BY s.seasonnumber
        `, 'Fail to retrieve show review!')
    }

    getVideo(req, res) {
        const { id } = req.query;

        connection.query(`SELECT video_url, \`type\` FROM movie WHERE id = ?`, [id], (err, result) => {
            if (err || result[0].video_url === "") {
                res.json({ data: { video_url: 'https://www.youtube.com/embed/bXykENe1wwY', type: result[0].type } });
            }
            else {
                res.json({ data: result[0] })
            }
        })
    }

}


module.exports = Season