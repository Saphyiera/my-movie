const data = require('../data/netflixDetails.json');
const connection = require('../db/connect');
const res = [];

// Iterate through each movie in the data
for (const movie in data) {
    const actors = data[movie]?.value?.videos?.[movie]?.details?.actors; // Array of actors {id: int, name: string}

    if (Array.isArray(actors)) { // Ensure actors is an array
        for (const actor of actors) {
            // Check if the actor is not already in `res`
            if (!res.some(a => a.id === actor.id)) {
                res.push(actor); // Add the actor to `res`
            }
        }
    }
    else {
        console.log(actors + " isnt a array");
    }
}

res.forEach((actor, i) => {
    try {
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
    } catch (error) {
        console.log(error);
    } finally {
        console.log(i);
    }
})

// Iterate through each movie in the data
let count = 0;
for (const movie in data) {
    const actors = data[movie]?.value?.videos?.[movie]?.details?.actors; // Array of actors {id: int, name: string}

    if (Array.isArray(actors)) { // Ensure actors is an array
        count += actors.length;
        for (const actor of actors) {
            // Check if the actor is not already in `res`
            if (!res.some(a => a.id === actor.id)) {
                res.push(actor); // Add the actor to `res`
            }
        }
    }
    else {
        console.log(actors + " isnt a array");
    }
}
console.log(count)

for (const movie in data) {
    const actors = data[movie]?.value?.videos?.[movie]?.details?.actors;
    if (Array.isArray(actors)) { // Ensure actors is an array
        actors.forEach(actor => {
            connection.query(`insert into movie_actor(movie_id,actor_id) values(?,?) on duplicate key update actor_id=values(actor_id)`, [movie, actor.id], (err, result) => {
                if (err) {
                    console.error(err);
                }
            })
        })
    }
    else {
        console.log(actors + " isnt a array");
    }
}