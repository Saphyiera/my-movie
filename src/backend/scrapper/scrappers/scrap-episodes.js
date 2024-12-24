const data = require('../data/episodes.json');
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

data.data.forEach((item, index) => {
    item.episodes.forEach((ep, idx) => {

        const id = ep.summary.id;
        const title = ep.title;
        const type = ep.summary.type;
        const synopsis = ep.contextualSynopsis.text;
        const releaseYear = null;
        const posterUrl = ep.interestingMoment._342x192.webp.value.url;
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
        } finally {
            console.log(index + "-" + idx);
        }
    })
})

data.data.forEach(season => {
    const seasonId = Number.parseInt(season.seasonId);
    season.episodes.forEach(ep => {
        const episodeId = ep.summary.id;
        const episodeNumber = ep.summary.episode;
        try {
            connection.query(`insert into season(seasonid,episodeid,episodenumber) values(?,?,?)`, [seasonId, episodeId, episodeNumber], (err, result) => {
                if (err) {
                    throw err;
                }
            })
        } catch (error) {
            console.log(error);
        }
    })
})