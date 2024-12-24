const data = require('../data/netflixDetails.json');
const connection = require('../db/connect');
const res = [];

for (const movie in data) {
    const genres = data[movie]?.value?.videos?.[movie]?.details?.genres; // Array of genres {id: int, name: string}

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
}

console.log(res.length);

res.forEach(genre => {
    connection.query(`insert into genre(id,name) values(?,?) on duplicate key update name=values(name)`, [genre.id, genre.name], (err, result) => {
        if (err) {
            console.error(err);
        }
    })
})

// Iterate through each movie in the data
let count = 0;
for (const movie in data) {
    const genres = data[movie]?.value?.videos?.[movie]?.details?.genres; // Array of genres {id: int, name: string}

    if (Array.isArray(genres)) { // Ensure genres is an array
        count += genres.length;
    }
    else {
        console.log(genres + " isnt a array");
    }
}
console.log(count)

for (const movie in data) {
    const genres = data[movie]?.value?.videos?.[movie]?.details?.genres; // Array of genres {id: int, name: string}

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
}