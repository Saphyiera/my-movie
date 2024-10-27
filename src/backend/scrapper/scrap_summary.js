const data = require('../../assets/netflix.json');
const status = require('../api/status')

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

const collections = data.value.searchPageByReferenceV2['EE68B871-74F8-4954-9125-64023FE6E64D\u001fEE68B871-74F8-4954-9125-64023FE6E64D/1//spider/0/0'];

const firstIndex = collections.summary.maxSections;
let c = 0;
try {
    for (let i = 0; i < firstIndex; i++) {
        const page = collections[i];
        const secondIndex = page.summary.maxItems;
        for (let ii = 0; ii < secondIndex; ii++) {
            const movie_summary = page[ii].summary;
            const id = movie_summary.entityId;
            const title = movie_summary.title;
            const poster_url = movie_summary.verticalArtworkUrl;
            const type = movie_summary.entityKind;
            const rating = genRating();
            const count = genCount();
            fetch("http://localhost:2811/movie", {
                method: "POST",
                body: JSON.stringify({
                    id,
                    title,
                    poster_url,
                    type,
                    synopsis: '',
                    release_year: 2020,
                    video_url: '',
                    rating,
                    count
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            }).then((res) => {
                if (res.status == status.OK) {
                    c++;
                    console.log(count);
                }
            })
        }
    }
} catch (error) {
    console.log(error);
}
