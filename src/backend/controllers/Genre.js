const connection = require('../db/connect')
const Base = require('./Base')

class Genre extends Base {
    constructor(id, name) {
        super(id);
        this.name = name;
    }

    getById() { }

    insertGenre(req, res) {
        const genre = {
            id: req.body.id,
            name: req.body.name
        }
        const query = `insert into genre(id,name)
        select * from (select '${genre.id}','${genre.name}') as tmp
        where not exists (select * from genre where id=${genre.id})`;

        connection.query(query, (err, result) => {
            if (err) {
                console.log("Bruh from genre insert");
                res.status(500).send();
            }
            else {
                res.status(200).send();
            }
        })
    }

    insertMovieGenre(req, res) {
        const query = `insert into movie_genre(movie_id,genre_id)
        select * from (select '${req.body.movieId}','${req.body.genreId}') as tmp
        where not exists (select * from movie_genre where movie_id=${req.body.movieId} and genre_id=${req.body.genreId})`;

        connection.query(query, (err) => {
            if (err) {
                console.log("Bruh from movie genre insert");
                res.status(500).send();
            }
            else {
                res.status(200).send();
            }
        })
    }

    getAllGenres(req, res) {
        connection.query('SELECT * FROM genre', (err, result) => {
            if (err) {
                console.error(err);
                res.json({ status: 500, message: err });
            } else {
                res.json({ status: 200, data: result });
            }
        })
    }
}

module.exports = Genre