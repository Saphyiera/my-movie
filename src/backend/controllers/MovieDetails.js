const connection = require('../db/connect')
const Movie = require('./Movie')

class MovieDetails extends Movie {
    constructor(id,
        title,
        type,
        synopsis,
        releaseYear,
        posterUrl,
        videoUrl,
        rating,
        count,
        actors,
        genres
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
        this.actors = actors;
        this.genres = genres;
    }

    getById(req, res) {
        const { id } = req.query;

        connection.query(
            `SELECT * FROM movie WHERE id = ?`,
            [id],
            (err, movieResult) => {
                if (err) {
                    console.error(err);
                    return res.json({ status: 500, message: err });
                }

                if (movieResult.length === 0) {
                    return res.json({ status: 404, message: 'Movie not found' });
                }

                const movieDetails = {
                    id: movieResult[0].id,
                    title: movieResult[0].title,
                    type: movieResult[0].type,
                    synopsis: movieResult[0].synopsis,
                    release_year: movieResult[0].release_year,
                    poster_url: movieResult[0].poster_url,
                    video_url: movieResult[0].video_url,
                    rating: movieResult[0].rating,
                    count: movieResult[0].count,
                };

                connection.query(
                    `SELECT a.id AS actor_id, a.name AS actor_name
                     FROM movie_actor ma
                     INNER JOIN actor a ON ma.actor_id = a.id
                     WHERE ma.movie_id = ?`,
                    [id],
                    (actorErr, actorResult) => {
                        if (actorErr) {
                            console.error(actorErr);
                            return res.json({ status: 500, message: actorErr });
                        }

                        const actors = actorResult.map(row => ({
                            id: row.actor_id,
                            name: row.actor_name,
                        }));

                        connection.query(
                            `SELECT g.id AS genre_id, g.name AS genre_name
                             FROM movie_genre mg
                             INNER JOIN genre g ON mg.genre_id = g.id
                             WHERE mg.movie_id = ?`,
                            [id],
                            (genreErr, genreResult) => {
                                if (genreErr) {
                                    console.error(genreErr);
                                    return res.json({ status: 500, message: genreErr });
                                }

                                const genres = genreResult.map(row => ({
                                    id: row.genre_id,
                                    name: row.genre_name,
                                }));

                                res.json({
                                    status: 200,
                                    data: {
                                        movie: movieDetails,
                                        actors: actors,
                                        genres: genres,
                                    },
                                });
                            }
                        );
                    }
                );
            }
        );
    }
}

module.exports = MovieDetails