const connection = require('../db/connect')
const Base = require('./Base')

class Movie extends Base {
    constructor(id,
        title,
        type,
        synopsis,
        releaseYear,
        posterUrl,
        videoUrl,
        rating,
        count) {
        super(id);
        this.title = title;
        this.type = type;
        this.synopsis = synopsis;
        this.releaseYear = releaseYear;
        this.posterUrl = posterUrl;
        this.videoUrl = videoUrl;
        this.rating = rating;
        this.count = count;
    }

    getAllMovies(req, res) {
        connection.query('select * from movie', (err, result) => {
            res.send(result)
        })
    }

    getById(id) {
        connection.query(`select * from movie where id=${id}`, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send();
            }
            else if (result.length == 0) {
                console.log("No movie with that id!");
                res.status(404).send();
            }
            else {
                console.log("OK");
                res.status(200).send(result);
            }
        })

    }

    getByTitle(query) {
        const title = query.toLowerCase();

        connection.query(`select * from movie where lower(title) like '%${title}%' and lower(type) in ('show', 'movie')`, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send();
            }
            else if (result.length == 0) {
                console.log(`Cant find a movie name ${title}}`);
                res.status(404).send();
            }
            else {
                res.status(200).send(result);
            }
        })
    }

    getMovie(req, res) {
        const id = req.query.id;
        const title = req.query.title.toLowerCase();
        if (id != undefined) {
            this.getById(id);
        }
        else if (title != undefined) {
            this.getByTitle(title);
        }
        else {
            res.status(400).send();
        }
    }

    insertMovie(req, res) {
        const movie = {
            id: req.body.id,
            title: req.body.title,
            type: req.body.type,
            synopsis: req.body.synopsis,
            release_year: req.body.release_year,
            poster_url: req.body.poster_url,
            video_url: req.body.video_url,
            rating: req.body.rating,
            count: req.body.count
        }
        connection.query("INSERT INTO movie SET ?", movie, (err) => {
            if (err) {
                console.log(err);
                res.status(status.ERROR_INSERT_DATA).send();
            }
            else {
                console.log("Done");
                res.status(status.OK).send();
            }
        })
    }

    updateMovie(req, res) {
        const { id, synopsis, releaseYear } = req.body;

        connection.query(`SELECT * FROM movie WHERE id = ?`, [id], (err, result) => {
            if (err) {
                console.error("Error querying movie for update:", err);
                return res.status(500).send();
            }

            if (result.length === 0) {
                console.log("Can't find that movie");
                return res.status(404).send();
            }

            connection.query(
                `UPDATE movie SET synopsis = ?, release_year = ? WHERE id = ?`,
                [synopsis, releaseYear, id],
                (err) => {
                    if (err) {
                        console.error("Error updating movie:", err);
                        return res.status(500).send();
                    }

                    console.log("Movie updated successfully");
                    res.status(200).send();
                }
            );
        });
    }

    countMovies(req, res) {
        connection.query(`
            SELECT 
                COUNT(CASE WHEN type = 'movie' THEN 1 END) AS count_movie,
                COUNT(CASE WHEN type = 'show' THEN 1 END) AS count_show
            FROM movie;
        `, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: err.message });
            }

            res.json({
                count: result[0].count_movie + result[0].count_show,
                count_movie: result[0].count_movie,
                count_show: result[0].count_show
            });
        });
    }

    suggestMovie(req, res, query) {
        const page = req.query.page || 1;
        const itemPerPage = req.query.pageSize ? Number.parseInt(req.query.pageSize) : 10;
        const type = req.query.type;
        let condition = [];

        if (type === 'all') {
            condition = ['show', 'movie'];
        } else if (type === 'show') {
            condition = ['show'];
        } else if (type === 'movie') {
            condition = ['movie'];
        } else {
            return res.status(400).json({ status: 400, message: "Invalid 'type' parameter" });
        }

        const offset = itemPerPage * (page - 1);

        connection.query(query, [condition, itemPerPage, offset], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ status: 500, message: err.message });
            } else {
                res.status(200).json({ status: 200, data: result });
            }
        });
    }

    suggestRecentMovies(req, res) {
        this.suggestMovie(req, res, `
    SELECT * FROM movie WHERE type IN (?) ORDER BY release_year DESC, rating DESC LIMIT ? OFFSET ?`);
    }

    suggestHighRatedMovies(req, res) {
        this.suggestMovie(req, res, `
        SELECT * FROM movie 
        WHERE type IN (?) 
        ORDER BY rating DESC, release_year DESC 
        LIMIT ? OFFSET ?`);
    }

    getAllMoviesv2(req, res) {
        this.suggestMovie(req, res, `
    SELECT * FROM movie WHERE type IN (?) LIMIT ? OFFSET ?`);
    }

    getmoviesByActors(req, res) {
        const actorIds = req.body.actorIds || [];
        console.log("Actors", actorIds);

        if (actorIds.length == 0) {
            res.json({ status: 400, message: "Actors required" });
        } else {
            connection.query(`
            SELECT  
                m.*, 
                COUNT(ma.actor_id) AS match_count,
                (m.rating / NULLIF(m.count, 0)) AS rating_ratio
            FROM 
                movie m 
            INNER JOIN 
                movie_actor ma 
            ON
                m.id = ma.movie_id
            WHERE 
                ma.actor_id IN (?) 
            AND 
                \`type\` IN ('show','movie')
            GROUP BY  
                m.id
            ORDER BY 
                match_count DESC, 
                rating_ratio DESC, 
                m.\`count\` DESC, 
                m.release_year DESC;
            `, [actorIds], (err, result) => {
                if (err) {
                    console.error(err);
                    res.json({ status: 500, message: err });
                }
                else if (result.length == 0) {
                    res.json({ status: 404, message: "No movies with selected actors" });
                }
                else {
                    res.json({ status: 200, data: result });
                }
            })
        }
    }

    getMoviesByGenres(req, res) {
        const genreIds = req.body.genreIds || [];
        console.log(genreIds);

        if (genreIds.length === 0) {
            res.json({ status: 400, message: "Genres required" });
        } else {
            connection.query(`
            SELECT 
                m.*, 
                COUNT(mg.genre_id) AS match_count,
                (m.rating / NULLIF(m.count, 0)) AS rating_ratio
            FROM 
                movie m
            INNER JOIN 
                movie_genre mg 
                ON m.id = mg.movie_id
            WHERE 
                mg.genre_id IN (?) 
                AND \`type\` IN ('show','movie')
            GROUP BY 
                m.id
            ORDER BY 
                match_count DESC, 
                rating_ratio DESC, 
                m.\`count\` DESC,
                m.release_year DESC;
            `, [genreIds], (err, result) => {
                if (err) {
                    console.error(err);
                    res.json({ status: 500, message: err });
                } else if (result.length === 0) {
                    res.json({ status: 404, message: "No movies with selected genres" });
                } else {
                    res.json({ status: 200, data: result });
                }
            });
        }
    }

    getMovieByTitleV2(req, res) {
        const { title } = req.body;

        const searchTerms = title.trim().split(/\s+/);
        const searchQuery = searchTerms.map(() => `title LIKE ?`).join(' AND ');

        const searchValues = searchTerms.map(term => `%${term}%`);

        connection.query(`
            SELECT * FROM movie WHERE ${searchQuery} AND LOWER(type) IN ('show','movie')
        `, searchValues, (err, result) => {
            if (err) {
                console.error(err);
                res.json({ status: 500, message: err });
            } else {
                res.json({ status: 200, data: result });
            }
        });
    }

    rateMovie(req, res) {
        const { rating, id } = req.query;

        if (!id || !rating) {
            return res.status(400).json({ message: 'Missing required parameters: id and rating' });
        }

        const parsedRating = parseFloat(rating);
        if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 10) {
            return res.status(400).json({ message: 'Invalid rating value. It should be between 0 and 10.' });
        }

        connection.query(
            `UPDATE movie SET rating = rating + ?, \`count\` = \`count\` + 1 WHERE id = ?`,
            [parsedRating, id],
            (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    res.status(500).json({ message: 'Internal server error' });
                } else if (results.affectedRows === 0) {
                    res.status(404).json({ message: 'Movie not found' });
                } else {
                    res.status(200).json({ message: 'Rating updated successfully' });
                }
            }
        );
    }

    async getWatchingMovieDetails(req, res) {
        const { id } = req.query;

        try {
            const [movie] = await connection.promise().query(`SELECT title, type, synopsis, rating, \`count\`, release_year FROM movie WHERE id = ?`, [id]);

            if (!movie.length) {
                return res.status(404).json({ message: 'Movie not found' });
            }

            if (movie[0].type.toLowerCase() === 'movie') {
                return res.status(200).json({ data: movie[0] });
            }

            const [season] = await connection.promise().query(`SELECT seasonid, episodenumber FROM season WHERE episodeid = ?`, [id]);

            if (!season.length) {
                return res.status(404).json({ message: 'Season not found' });
            }

            const [series] = await connection.promise().query(`SELECT s.serieid, s.seasonnumber, m.title FROM serie s INNER JOIN movie m ON s.serieid = m.id WHERE s.seasonid = ?`, [season[0].seasonid]);

            if (!series.length) {
                return res.status(404).json({ message: 'Series not found' });
            }

            return res.json({
                data: {
                    title: movie[0].title,
                    synopsis: movie[0].synopsis,
                    seasonnumber: series[0].seasonnumber,
                    episodenumber: season[0].episodenumber,
                    showname: series[0].title,
                    rating: movie[0].rating,
                    count: movie[0].count,
                    release_year: movie[0].release_year,
                    serieid: series[0].serieid,
                }
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = Movie