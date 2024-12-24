const data = require('../data/seasons-detail.json');
const connection = require('../db/connect');

const genRating = () => {
    const rating = Math.random();
    if (rating < 0.1) {
        return Math.floor(rating * 6) + 1;
    }
    else {
        return Math.floor(rating * 4) + 7;
    }
}

const genCount = () => {
    return Math.floor(Math.random() * 1000);
}

data.forEach(item => {
    const id = Number.parseInt(item.titleId, 10);
    const title = item.details.title;
    const type = item.details.type;
    const synopsis = item.details.synopsis;
    const releaseYear = item.details.releaseYear;
    const posterUrl = item.details.backgroundImage.url;
    const videoUrl = "";
    const count = genCount();
    const rating = genRating() * count;

    try {
        connection.query(`
            insert into movie(id,title,type,synopsis,release_year,poster_url,video_url,rating,count)
             values (?,?,?,?,?,?,?,?,?)`, [id, title, type, synopsis, releaseYear, posterUrl, videoUrl, rating, count],
            (err, result) => {
                if (err) {
                    throw err;
                }
            })
    } catch (error) {
        console.log(error);
    }
})

let res = [];

data.forEach(season => {
    const cast = season.details.cast;
    if (Array.isArray(cast)) {
        cast.forEach(actor => {
            if (!res.some(a => a.id === actor.id)) {
                res.push(actor);
            }
        })
    }
    else {
        console.log(cast + " isnt array!")
    }
})
console.log(res);

res.forEach(actor => {
    connection.query(`
        INSERT INTO actor (id, name)
        VALUES (?,?)
        ON DUPLICATE KEY UPDATE
        name = VALUES(name);
        `, [actor.id, actor.name], (err, result) => {
        if (err) {
            console.error(err);
        }
    })
})

data.forEach(season => {
    const cast = season.details.cast;
    const seasonId = Number.parseInt(season.titleId);
    if (Array.isArray(cast)) {
        cast.forEach(actor => {
            connection.query(`insert into movie_actor(movie_id,actor_id) values(?,?) on duplicate key update actor_id=values(actor_id)`, [seasonId, actor.id], (err, result) => {
                if (err) {
                    console.error(err);
                }
            })
        })
    }
    else {
        console.log(cast + " isnt array!")
    }
})

res = [];

data.forEach(season => {
    const genres = season.details.genres;
    if (Array.isArray(genres)) {
        genres.forEach(genre => {
            if (!res.some(a => a.id === genre.id)) {
                res.push(genre);
            }
        })
    }
})

res.forEach(genre => {
    connection.query(`insert into genre(id,name) values(?,?) on duplicate key update name=values(name)`, [genre.id, genre.name], (err, result) => {
        if (err) {
            console.error(err);
        }
    })
})

data.forEach(season => {
    const genres = season.details.genres;
    if (Array.isArray(genres)) {
        genres.forEach(genre => {
            connection.query(`insert into movie_genre(movie_id,genre_id) values(?,?) on duplicate key update genre_id=values(genre_id)`, [Number.parseInt(season.titleId), genre.id], (err, result) => {
                if (err) {
                    console.error(err);
                }
            })
        })
    } else {
        console.log(genres + " isnt a array");
    }
})