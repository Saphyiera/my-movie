const data = require('../data/seasons.json');
const connection = require('../db/connect');

let res = "";

data.forEach(movie => {
    if (movie.seasons.length > 0) {
        movie.seasons.forEach(season => {
            res += season.seasonId.toString() + ','
        })
    }
})

console.log(res);

data.forEach((movie, i) => {
    if (movie.seasons.length > 0) {
        const serieId = Number.parseInt(movie.titleId, 10);
        movie.seasons.forEach((season, ii) => {
            const seasonId = season.seasonId;
            const seasonNumber = ii + 1;
            const seasonTitle = season.name;
            try {
                connection.query(`insert into serie(serieid,seasonid,seasonnumber,seasontitle) values(?,?,?,?)`, [serieId, seasonId, seasonNumber, seasonTitle], (err, result) => {
                    if (err) {
                        throw err;
                    }
                })
            } catch (error) {
                console.log(error)
            } finally {
                console.log(i + "-" + ii);
            }
        })
    }
})

