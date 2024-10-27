const express = require('express')
const status = require('./api/status')

const app = express()
const port = process.env.PORT || 2811

app.use(express.json())
app.listen(
    port,
    () => {
        console.log(`Server is running on port ${port}`);
    }
)

const mysql = require('mysql2');
require('dotenv').config()

const connection = mysql.createConnection(
    {
        // host: process.env.DB_HOST,
        // user: process.env.DB_USERNAME,
        // password: process.env.DB_PASSWORD
        host: 'localhost',
        user: 'root',
        password: 'ROOT',
        database: 'movie'
    }
)

connection.connect((error) => {
    if (error) throw error;
    console.log("Connected to movie database!");
})

app.get('/', (req, res) => {
    const query = 'select * from movie';
    connection.query(query, (err, result) => {
        res.send(result)
    })
})

app.get('/get_movie_by_id', (req, res) => {
    const id = req.query.id;

    connection.query(`select * from movie where id=${id}`, (err, result) => {
        if (result.length == 0) {
            res.status(404).send(`Cant find a movie with id ${id}`)
        }
        else {
            res.send(result)
        }
    })
})

app.get('/get_movie_by_title', (req, res) => {
    const title = req.query.title;

    connection.query(`select * from movie where title=${title}`, (err, result) => {
        if (result.length == 0) {
            res.status(404).send(`Cant find a movie name ${title}}`)
        }
        else {
            res.send(result)
        }
    })
})

app.post('/signup', () => {

})

app.post('/login', () => {

})

app.post('/movie', (req, res) => {
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
})

app.post('/update/movie', (req, res) => {
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
});


app.get('/get_all_ids', (req, res) => {
    const query = 'SELECT id FROM movie';

    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching IDs');
        }

        const ids = results.map(row => row.id);

        res.json(ids);
    });
});

app.post('/actor', (req, res) => {
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
})

app.post('/genre', (req, res) => {
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
})

app.post('/movie-genre', (req, res) => {
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
})

app.post('/movie-actor', (req, res) => {
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
})
app.post('/user', (req, res) => {
    const query = `insert into user(username,password)
    select * from (select '${req.body.username}','${req.body.password}') as tmp
    where not exists (select * from user where username=${req.body.username})`;

    connection.query(query, (err) => {
        if (err) {
            console.log("Bruh from user insert");
            res.status(500).send();
        }
        else {
            res.status(200).send();
        }
    })
})