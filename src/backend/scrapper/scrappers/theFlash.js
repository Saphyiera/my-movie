const seasons = require('./the-flash-seasons.json');
const episodes = require('./the_flash.json');
const connection = require('../db/connect');

let res = [];
seasons.forEach(season => {
    const genres = season.details.genres;
    if (Array.isArray(genres)) { // Ensure genres is an array
        for (const genre of genres) {
            // Check if the genre is not already in `res`
            if (!res.some(a => a.id === genre.id)) {
                res.push(genre); // Add the genre to `res`
            }
        }
    }
    else {
        console.log(genres + " isnt a array");
    }
})

console.log(res.length);

res.forEach(genre => {
    connection.query(`insert into genre(id,name) values(?,?) on duplicate key update name=values(name)`, [genre.id, genre.name], (err, result) => {
        if (err) {
            console.error(err);
        }
    })
})

seasons.forEach(season => {
    const movie = Number.parseInt(season.titleId);
    const genres = season.details.genres;
    if (Array.isArray(genres)) { // Ensure genres is an array
        genres.forEach(genre => {
            connection.query(`insert into movie_genre(movie_id,genre_id) values(?,?) on duplicate key update genre_id=values(genre_id)`, [movie, genre.id], (err, result) => {
                if (err) {
                    console.error(err);
                }
            })
        })
    }
    else {
        console.log(genres + " isnt a array");
    }
})

res = [];
seasons.forEach(season => {
    const cast = season.details.cast;
    if (Array.isArray(cast)) {
        cast.forEach(actor => {
            if (!res.some(a => a.id === actor.id)) {
                res.push(actor); // Add the actor to `res`
            }
        })
    } else {
        console.log(cast + " isnt array!")
    }
})

console.log(res.length);

res.forEach((actor) => {

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

seasons.forEach(season => {
    const cast = season.details.cast;
    if (Array.isArray(cast)) {
        cast.forEach(actor => {
            connection.query(`insert into movie_actor(movie_id,actor_id) values(?,?) on duplicate key update actor_id=values(actor_id)`, [Number.parseInt(season.titleId), actor.id], (err, result) => {
                if (err) {
                    console.error(err);
                }
            })
        })
    } else {
        console.log(cast + " isnt array!")
    }
})

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

res = ""
data.shows[80027042].seasons.forEach(season => {
    res += season.seasonId.toString() + ","
})
console.log(res);

data.shows[80027042].seasons.forEach(season => {
    const seasonId = season.seasonId;
    const seasonNumber = season.season;
    const seasonTitle = season.title;
    const serieId = 8002742;
    try {
        connection.query(`insert into serie(serieid,seasonid,seasonnumber,seasontitle) values(?,?,?,?)`, [serieId, seasonId, seasonNumber, seasonTitle], (err, result) => {
            if (err) {
                throw new Error(err);
            } else {
                console.log(result);
            }
        })
    } catch (error) {
        console.log(error);
    }
});

seasons.forEach((season, i) => {
    const id = season.details.id;
    const title = season.details.title;
    const type = season.details.type;
    const synopsis = season.details.synopsis;
    const releaseYear = season.details.releaseYear;
    const posterUrl = season.details.backgroundImage.url;
    const videoUrl = "";
    const count = genCount();
    const rating = genRating() * count;

    try {
        connection.query(`insert into movie(id,title,type,synopsis,release_year,poster_url,video_url,rating,count) values(?,?,?,?,?,?,?,?,?)`,
            [id, title, type, synopsis, releaseYear, posterUrl, videoUrl, rating, count], (err, result) => {
                if (err) {
                    throw err;
                }
            })
    } catch (error) {
        console.log(error);
    } finally {
        console.log(i)
    }
})

for (const episodeId in episodes.entities) {
    const episode = episodes.entities[`${episodeId}`];
    const id = episode.summary.id;
    const title = episode.summary.title;
    const type = episode.summary.type;
    const synopsis = episode.summary.synopsis;
    const releaseYear = null;
    const posterUrl = episode.summary.interestingMomentUrl;
    const videoUrl = "";
    const count = genCount();
    const rating = genRating() * count;
    try {
        connection.query(`insert into movie(id,title,type,synopsis,release_year,poster_url,video_url,rating,count) values(?,?,?,?,?,?,?,?,?)`,
            [id, title, type, synopsis, releaseYear, posterUrl, videoUrl, rating, count], (err, result) => {
                if (err) {
                    throw err;
                }
            })
    } catch (error) {
        console.log(error);
    } finally {
        console.log(id)
    }
}

episodes.shows[80027042].seasons.forEach((season, i) => {
    const seasonId = season.seasonId;
    const seasonNumber = season.season;
    const seasonTitle = season.title;
    try {
        connection.query(`insert into serie(serieid,seasonid,seasonnumber,seasontitle) values(?,?,?,?)`, [80027042, seasonId, seasonNumber, seasonTitle], (err, result) => {
            if (err) {
                throw err;
            }
        })
    } catch (error) {
        console.log(error);
    } finally {
        console.log(i);
    }
})

for (const episodeId in episodes.entities) {
    const episode = episodes.entities[`${episodeId}`].summary;
    const seasonId = episode.seasonId;
    const episodeNumber = episode.episodeNumber;

    try {
        connection.query(`insert into season(seasonid,episodeid,episodenumber) values(?,?,?)`, [seasonId, episodeId, episodeNumber], (err, result) => {
            if (err) {
                throw err;
            }
        })
    } catch (error) {
        console.log(error);
    } finally { console.log(episodeId) };
}

