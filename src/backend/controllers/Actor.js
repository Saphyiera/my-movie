const connection = require('../db/connect')
const Base = require('./Base')

class Actor extends Base {
    constructor(id, name) {
        super(id);
        this.name = name;
    }

    getById() { }

    insertActor(req, res) {
        const actor = {
            id: req.body.id,
            name: req.body.name
        }
        const query =
            `insert into actor(id,name)
        select * from (select '${actor.id}', '${actor.name}') as tmp
        where not exists (select * from actor where id = ${actor.id})`

        connection.query(query, (err, result) => {
            if (err) {
                res.status(500).send(`Cant insert ${actor.name}`).send();
                console.log("Bruh from actor insert");
            }
            else {
                res.status(200).send();
            }
        })
    }

    insertMovieActor(req, res) {
        const query = `insert into movie_actor(movie_id,actor_id)
        select * from (select '${req.body.movieId}','${req.body.actorId}') as tmp
        where not exists (select * from movie_actor where movie_id=${req.body.movieId} and actor_id=${req.body.actorId})`;

        connection.query(query, (err) => {
            if (err) {
                console.log("Bruh from movie actor insert");
                res.status(500).send();
            }
            else {
                res.status(200).send();
            }
        })
    }

    getAllActors(req, res) {
        connection.query('SELECT * FROM actor', (err, result) => {
            if (err) {
                console.error(err);
                res.json({ status: 500, message: err });
            } else {
                res.json({ status: 200, data: result });
            }
        })
    }
}

module.exports = Actor