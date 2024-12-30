const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
const status = require('./api/status');
const cors = require('cors');
const { checkAndGenerateKeyPair, PUBLIC_KEY_FILE, PRIVATE_KEY_FILE } = require('./keyGen.js');
const cloudinary = require('cloudinary').v2;
const uuid = require('uuid').v7;
const paypal = require('./api/payment/paypal.js')
require('dotenv').config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (uri) => {
    try {
        if (!uri.startsWith('data:image/')) {
            throw new Error('Invalid image URI. Must be an accessible URI.');
        }
        const uniqueFilename = `${uuid()}`;
        const result = await cloudinary.uploader.upload(uri, {
            public_id: uniqueFilename,
            overwrite: true,
            transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });

        console.log('Image uploaded successfully:', result.url);
        return result.url;
    } catch (error) {
        throw error;
    }
};

const uploadBase64Image = async (base64Image) => {
    try {
        const uniqueFilename = `${uuid()}`;
        const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Image}`, {
            public_id: uniqueFilename,
            overwrite: true,
            transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });

        console.log('Image uploaded successfully:', result.url);
        return result.url;
    } catch (error) {
        console.error('Error uploading base64 image to Cloudinary:', error);
        throw error;
    }
};

checkAndGenerateKeyPair();

const privateKey = fs.readFileSync(PRIVATE_KEY_FILE, 'utf-8');

const secretKey = process.env.JWT_SECRET;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express()
const port = process.env.PORT || 2811

app.use(express.json());
app.use(cors());

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
    if (error) console.log(error);
    console.log("Connected to movie database!");
})

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'erinelinguester@gmail.com',
        pass: 'alsg vbbh hihg idyj'
    }
});

app.get('/public-key', (req, res) => {
    fs.readFile(PUBLIC_KEY_FILE, 'utf8', (err, publicKey) => {
        if (err) {
            console.error('Error reading public key file:', err);
            return res.status(500).send('Failed to load the public key');
        }
        res.type('text/plain');
        res.send(publicKey);
    });
});

app.get('/', (req, res) => {
    const query = 'select * from movie';
    connection.query(query, (err, result) => {
        res.send(result)
    })
})

app.get('/movie', (req, res) => {
    const id = req.query.id;
    const title = req.query.title.toLowerCase();

    if (id != undefined) {
        connection.query(`select * from movie where id=${id}`, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send();
            }
            else if (result.length == 0) {
                console.log("No movie with that id!");
                res.status(404).send();
            }
            else {
                console.log("OK");
                res.status(200).send(result);
            }
        })
    }
    else if (title != undefined) {
        connection.query(`select * from movie where lower(title) like '%${title}%'`, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send();
            }
            else if (result.length == 0) {
                console.log(`Cant find a movie name ${title}}`);
                res.status(404).send();
            }
            else {
                res.status(200).send(result);
            }
        })
    }
    else {
        res.status(400).send();
    }
})

app.post('/signup', (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    };
    console.log(user);

    connection.query(`SELECT * FROM \`user\` WHERE username = '${user.username}'`, (err, result) => {
        if (err) {
            console.log(err);
            console.log("From select username");
            res.status(500).send({ message: err.message });
        } else if (result.length !== 0) {
            console.log("This user already exists!");
            res.status(409).send({ message: "Username existed!" });
        } else {
            try {
                const bufferPassword = Buffer.from(user.password, 'base64');
                const decryptedPassword = crypto.privateDecrypt({
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256',
                }, bufferPassword).toString('utf8');
                console.log("Decrypted Password: ", decryptedPassword);

                const hashedPassword = crypto.createHash('sha256').update(decryptedPassword).digest('hex');
                console.log("Hashed Password: ", hashedPassword);

                connection.query('SELECT MAX(id) AS maxId FROM \`user\`', (err1, result1) => {
                    if (err1) {
                        console.log(err1);
                        console.log("Error fetching max ID");
                        res.status(500).send({ message: err1.message });
                    } else {
                        const newUserId = result1[0] ? result1[0].maxId + 1 : 1;

                        connection.query(`INSERT INTO \`user\` (id, username, password, email, email_is_verified, available) VALUES (?, ?, ?, ?, 0, 1)`, [newUserId, user.username, hashedPassword, user.email], (err2) => {
                            if (err2) {
                                console.log(err2);
                                console.log("From insert user");
                                res.status(500).send({ message: err2.message });
                            } else {
                                console.log("Success");
                                res.status(200).send({ message: "OK" });
                            }
                        });
                    }
                });
            } catch (err) {
                console.log(err);
                res.status(500).send({ message: "Error decrypting password" });
            }
        }
    });
});

app.post('/login', (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.password
    }

    connection.query(`select * from user where username = '${user.username}'`, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({ message: err.message });
        }
        else if (result.length == 0) {
            console.log("User doesn't exist!");
            res.status(404).send({ message: "There's no user with username: " + user.username });
        }
        else {
            try {
                const bufferPassword = Buffer.from(user.password, 'base64');
                const decryptedPassword = crypto.privateDecrypt({
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256',
                }, bufferPassword).toString('utf8');
                console.log("Decrypted Password: ", decryptedPassword);

                const hashedPassword = crypto.createHash('sha256').update(decryptedPassword).digest('hex');
                console.log("Hashed Password: ", hashedPassword);
                if (hashedPassword === result[0].password) {
                    console.log(result[0]);
                    res.json({ data: result[0], token: jwt.sign({ userId: result[0].id }, secretKey) });
                }
                else {
                    console.log("Wrong password");
                    res.status(401).json({ message: "Wrong password!" });
                }

            } catch (err) {
                console.log(err);
                res.status(500).send({ message: "Error decrypting password" });
            }
        }
    })
})

app.get('/user', (req, res) => {
    const { id } = req.query;
    connection.query(`SELECT * FROM user WHERE id = ?`, [id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        } else if (result.length === 0) {
            res.status(404).json({ message: `User with id ${id} not found` });
        } else {
            res.json({ data: result[0] });
        }
    });
});

app.post('/user/verify-email', (req, res) => {
    const { email, id } = req.body;

    if (!email || !id) {
        return res.status(400).json({ message: "Email and ID are required" });
    }

    const verificationUrl = `http://localhost:2811/user/verify?id=${id}`;

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Verify Your Email',
        html: `
            <h2>Email Verification For Movie Website</h2>
            <p>Click the button below to verify your email:</p>
            <a href="${verificationUrl}" style="padding: 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error sending email', error: error.message });
        }
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Verification email sent successfully' });
    });
});

app.get('/user/verify', (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: "Missing user ID" });
    }

    connection.query(`UPDATE \`user\` SET email_is_verified = 1 WHERE id = ?`, [id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
        else {
            console.log(`User with ID ${id} has verified their email`);
            res.status(200).send(`Email verification successful for user ID: ${id}`);
        }
    })
});

app.post('/user/profile-picture', upload.single('image'), async (req, res) => {
    const userId = req.body.userId;
    let url = "";
    try {
        url = await uploadBase64Image(req.file.buffer.toString('base64'));

        connection.query(
            `UPDATE \`user\` SET profile_picture = ? WHERE id = ?`,
            [url, userId],
            (err, result) => {
                if (err) {
                    console.error("Error updating profile picture:", err);
                    return res.status(500).json({ message: 'Error updating profile picture' });
                }
                res.status(200).json({ message: 'Profile picture updated successfully', url });
            }
        );
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: 'Error uploading image!' });
    }
});

app.post('/user/info', (req, res) => {
    const { id, info } = req.body;
    connection.query(`update \`user\` set info = ? where id = ?`, [info, id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        } else {
            res.send();
        }
    })
})

app.post('/user/email', (req, res) => {
    const { id, email } = req.body;

    if (!id || !email) {
        return res.status(400).json({ message: 'User ID and email are required.' });
    }

    const query = `UPDATE \`user\` SET email = ?, email_is_verified = 0 WHERE id = ?`;

    connection.query(query, [email, id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (result.affectedRows === 0) {
            console.log(result);
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'Email updated successfully and verification reset.' });
    });
});


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

app.get('/movie/count', (req, res) => {
    const query = `
        SELECT 
            COUNT(CASE WHEN type = 'movie' THEN 1 END) AS count_movie,
            COUNT(CASE WHEN type = 'show' THEN 1 END) AS count_show
        FROM movie;
    `;

    connection.query(query, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }

        res.json({
            count: result[0].count_movie + result[0].count_show,
            count_movie: result[0].count_movie,
            count_show: result[0].count_show
        });
    });
});

app.get('/suggestions/recent', (req, res) => {
    const page = req.query.page || 1;
    const itemPerPage = req.query.pageSize ? Number.parseInt(req.query.pageSize) : 10;
    const type = req.query.type;
    let condition = [];

    if (type === 'all') {
        condition = ['show', 'movie'];
    } else if (type === 'show') {
        condition = ['show'];
    } else if (type === 'movie') {
        condition = ['movie'];
    } else {
        return res.status(400).json({ status: 400, message: "Invalid 'type' parameter" });
    }

    const offset = itemPerPage * (page - 1);
    const query = `
    SELECT * FROM movie WHERE type IN (?) ORDER BY release_year DESC, rating DESC LIMIT ? OFFSET ?`;

    connection.query(query, [condition, itemPerPage, offset], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: err.message });
        } else {
            res.status(200).json({ status: 200, data: result });
        }
    });
});

app.get('/suggestions/rating', (req, res) => {
    const page = req.query.page || 1;
    const itemPerPage = req.query.pageSize ? Number.parseInt(req.query.pageSize) : 10;
    const type = req.query.type;
    let condition = [];

    if (type === 'all') {
        condition = ['show', 'movie'];
    } else if (type === 'show') {
        condition = ['show'];
    } else if (type === 'movie') {
        condition = ['movie'];
    } else {
        return res.status(400).json({ status: 400, message: "Invalid 'type' parameter" });
    }

    const offset = itemPerPage * (page - 1);
    const query = `
        SELECT * FROM movie 
        WHERE type IN (?) 
        ORDER BY rating DESC, release_year DESC 
        LIMIT ? OFFSET ?`;

    connection.query(query, [condition, itemPerPage, offset], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: err.message });
        } else {
            res.status(200).json({ status: 200, data: result });
        }
    });
});


app.get('/suggestions/all', (req, res) => {
    const page = req.query.page || 1;
    const itemPerPage = req.query.pageSize ? Number.parseInt(req.query.pageSize) : 10;
    const offset = itemPerPage * (page - 1);

    const type = req.query.type;
    let condition = [];

    if (type === 'all') {
        condition = ['show', 'movie'];
    } else if (type === 'show') {
        condition = ['show'];
    } else if (type === 'movie') {
        condition = ['movie'];
    } else {
        return res.status(400).json({ status: 400, message: "Invalid 'type' parameter" });
    }

    const query = `
    SELECT * FROM movie WHERE type IN (?) LIMIT ? OFFSET ?`;

    connection.query(query, [condition, itemPerPage, offset], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: err.message });
        } else {
            res.status(200).json({ status: 200, data: result });
        }
    });
});


app.get('/genres/all', (req, res) => {
    connection.query('SELECT * FROM genre', (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: err });
        } else {
            res.json({ status: 200, data: result });
        }
    })
})

app.get('/actors/all', (req, res) => {
    connection.query('SELECT * FROM actor', (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: err });
        } else {
            res.json({ status: 200, data: result });
        }
    })
})

app.post('/get/movies/actor', (req, res) => {
    const actorIds = req.body.actorIds || [];
    console.log("Actors", actorIds);

    if (actorIds.length == 0) {
        res.json({ status: 400, message: "Actors required" });
    } else {
        const query = `
        SELECT  
            m.*, 
            COUNT(ma.actor_id) AS match_count,
            (m.rating / NULLIF(m.count, 0)) AS rating_ratio
        FROM 
            movie m 
        INNER JOIN 
            movie_actor ma 
        ON
            m.id = ma.movie_id
        WHERE 
            ma.actor_id IN (?) 
        AND 
            \`type\` IN ('show','movie')
        GROUP BY  
            m.id
        ORDER BY 
            match_count DESC, 
            rating_ratio DESC, 
            m.\`count\` DESC, 
            m.release_year DESC;
        `
        connection.query(query, [actorIds], (err, result) => {
            if (err) {
                console.error(err);
                res.json({ status: 500, message: err });
            }
            else if (result.length == 0) {
                res.json({ status: 404, message: "No movies with selected actors" });
            }
            else {
                res.json({ status: 200, data: result });
            }
        })
    }
})

app.post('/get/movies/genre', (req, res) => {
    const genreIds = req.body.genreIds || [];
    console.log(genreIds);

    if (genreIds.length === 0) {
        res.json({ status: 400, message: "Genres required" });
    } else {
        const query = `
        SELECT 
            m.*, 
            COUNT(mg.genre_id) AS match_count,
            (m.rating / NULLIF(m.count, 0)) AS rating_ratio
        FROM 
            movie m
        INNER JOIN 
            movie_genre mg 
            ON m.id = mg.movie_id
        WHERE 
            mg.genre_id IN (?) 
            AND \`type\` IN ('show','movie')
        GROUP BY 
            m.id
        ORDER BY 
            match_count DESC, 
            rating_ratio DESC, 
            m.\`count\` DESC,
            m.release_year DESC;
        `;
        connection.query(query, [genreIds], (err, result) => {
            if (err) {
                console.error(err);
                res.json({ status: 500, message: err });
            } else if (result.length === 0) {
                res.json({ status: 404, message: "No movies with selected genres" });
            } else {
                res.json({ status: 200, data: result });
            }
        });
    }
});


app.post('/get/movie/title', (req, res) => {
    const { title } = req.body;

    const searchTerms = title.trim().split(/\s+/);
    const searchQuery = searchTerms.map(() => `title LIKE ?`).join(' AND ');

    const searchValues = searchTerms.map(term => `%${term}%`);

    connection.query(`
        SELECT * FROM movie WHERE ${searchQuery}
    `, searchValues, (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: err });
        } else {
            res.json({ status: 200, data: result });
        }
    });
});

app.get('/movie/details', (req, res) => {
    const { id } = req.query;

    connection.query(
        `SELECT * FROM movie WHERE id = ?`,
        [id],
        (err, movieResult) => {
            if (err) {
                console.error(err);
                return res.json({ status: 500, message: err });
            }

            if (movieResult.length === 0) {
                return res.json({ status: 404, message: 'Movie not found' });
            }

            const movieDetails = {
                id: movieResult[0].id,
                title: movieResult[0].title,
                type: movieResult[0].type,
                synopsis: movieResult[0].synopsis,
                release_year: movieResult[0].release_year,
                poster_url: movieResult[0].poster_url,
                video_url: movieResult[0].video_url,
                rating: movieResult[0].rating,
                count: movieResult[0].count,
            };

            connection.query(
                `SELECT a.id AS actor_id, a.name AS actor_name
                 FROM movie_actor ma
                 INNER JOIN actor a ON ma.actor_id = a.id
                 WHERE ma.movie_id = ?`,
                [id],
                (actorErr, actorResult) => {
                    if (actorErr) {
                        console.error(actorErr);
                        return res.json({ status: 500, message: actorErr });
                    }

                    const actors = actorResult.map(row => ({
                        id: row.actor_id,
                        name: row.actor_name,
                    }));

                    connection.query(
                        `SELECT g.id AS genre_id, g.name AS genre_name
                         FROM movie_genre mg
                         INNER JOIN genre g ON mg.genre_id = g.id
                         WHERE mg.movie_id = ?`,
                        [id],
                        (genreErr, genreResult) => {
                            if (genreErr) {
                                console.error(genreErr);
                                return res.json({ status: 500, message: genreErr });
                            }

                            const genres = genreResult.map(row => ({
                                id: row.genre_id,
                                name: row.genre_name,
                            }));

                            res.json({
                                status: 200,
                                data: {
                                    movie: movieDetails,
                                    actors: actors,
                                    genres: genres,
                                },
                            });
                        }
                    );
                }
            );
        }
    );
});

app.get('/movie/comments', (req, res) => {
    const id = req.query.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    const query = `
        SELECT 
            c.commentid, c.movieid, c.comment, c.postdate, c.hidden, c.userid,
            GROUP_CONCAT(hc.reason SEPARATOR ',') AS reasons, 
            u.username, u.email, u.created_at, u.available, u.profile_picture
        FROM 
            \`comment\` c
        LEFT JOIN 
            hidden_comment hc ON c.commentid = hc.commentid
        INNER JOIN 
            \`user\` u ON c.userid = u.id
        WHERE 
            c.movieid = ?
        GROUP BY 
            c.commentid, c.movieid, c.comment, c.postdate, c.hidden, c.userid,
            u.username, u.email, u.created_at, u.available, u.profile_picture
        ORDER BY
            c.postdate DESC
        LIMIT ? OFFSET ?;
    `;

    connection.query(query, [id, limit, offset], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: "Error executing query", error: err });
        } else {
            const data = result.map((comment) => {
                return {
                    ...comment,
                    reasons: comment.reasons ? comment.reasons.split(',') : []
                };
            });

            const countQuery = `
                SELECT COUNT(*) AS total 
                FROM \`comment\` 
                WHERE movieid = ?;
            `;

            connection.query(countQuery, [id], (countErr, countResult) => {
                if (countErr) {
                    console.error(countErr);
                    res.status(500).json({ status: 500, message: "Error fetching total count", error: countErr });
                } else {
                    const total = countResult[0].total;
                    const totalPages = Math.ceil(total / limit);

                    res.json({
                        status: 200,
                        data,
                        pagination: {
                            total,
                            totalPages,
                            currentPage: page,
                            limit,
                        },
                    });
                }
            });
        }
    });
});

app.post('/movie/comment/', (req, res) => {
    const { userId, movieId, comment } = req.body;

    connection.query(`INSERT INTO \`comment\`(userid,movieid,comment,hidden) VALUES(?,?,?,0)`, [userId, movieId, comment], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: err });
        } else {
            res.json({ status: 200, data: result });
        }
    })
})
/**
 * 
 * Havent used this shit
 * 
 */

app.post('/movie/comment/hide', (req, res) => {
    const { commentId, reasons } = req.body;

    const values = reasons.map((reason) => {
        return [commentId, reason];
    })

    connection.query(`UPDATE \`comment\` SET hidden = 1 WHERE commentid = ?`, [commentId], (updateErr) => {
        if (updateErr) {
            res.status(500).json({ status: 500, message: updateErr.message });
        }
        else {
            connection.query(`INSERT INTO hidden_comment(commentid,reason) VALUES(?,?)`, [reasons], (err, result) => {
                if (err) {
                    console.error(err);
                    res.json({ status: 500, message: err });
                } else {
                    res.json({ status: 200, data: result });
                }
            })
        }
    })
})

app.post('/movie/comment/report', (req, res) => {
    const { commentId, reasons, reporterId } = req.body;

    if (!Array.isArray(reasons) || !commentId || !reporterId || reasons.length === 0) {
        return res.status(400).json({ status: 400, message: "Invalid input data" });
    }

    const values = reasons.map((reason) => [commentId, reason, reporterId]);

    const query = `INSERT INTO reported_comment (commentid, reason, reporterid) VALUES ? ON DUPLICATE KEY UPDATE reason = VALUES(reason)`;

    connection.query(query, [values], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 500, message: "Server Error", error: err });
        } else {
            return res.status(200).json({ status: 200, message: "Reports submitted successfully", data: result });
        }
    });
});

app.delete('/movie/comment', (req, res) => {
    const { commentid } = req.body;

    connection.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ status: 500, message: "Server Error: Unable to start transaction" });
        }

        connection.query(`DELETE FROM hidden_comment WHERE commentid = ?`, [commentid], (hcErr) => {
            if (hcErr) {
                return connection.rollback(() => {
                    res.status(500).json({ status: 500, message: "Server Error: Deleting from hidden_comment" });
                });
            }

            connection.query(`DELETE FROM comment WHERE commentid = ?`, [commentid], (err) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ status: 500, message: "Server Error: Deleting from comment" });
                    });
                }

                connection.commit((commitErr) => {
                    if (commitErr) {
                        return connection.rollback(() => {
                            res.status(500).json({ status: 500, message: "Server Error: Committing transaction" });
                        });
                    }
                    res.status(200).send();
                });
            });
        });
    });
});

app.delete('/movie/comment', (req, res) => {
    const { commentid } = req.body;

    connection.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ status: 500, message: "Server Error: Unable to start transaction" });
        }

        connection.query(`DELETE FROM hidden_comment WHERE commentid = ?`, [commentid], (hcErr) => {
            if (hcErr) {
                return connection.rollback(() => {
                    res.status(500).json({ status: 500, message: "Server Error: Deleting from hidden_comment" });
                });
            }

            connection.query(`DELETE FROM comment WHERE commentid = ?`, [commentid], (err) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ status: 500, message: "Server Error: Deleting from comment" });
                    });
                }

                connection.commit((commitErr) => {
                    if (commitErr) {
                        return connection.rollback(() => {
                            res.status(500).json({ status: 500, message: "Server Error: Committing transaction" });
                        });
                    }
                    res.status(200).send();
                });
            });
        });
    });
});

app.get('/movie/seasons', (req, res) => {
    const { serieId } = req.query;

    const query = `
        SELECT 
            s.seasonid,
            s.seasonnumber, 
            s.seasontitle,
            m.synopsis, 
            m.release_year, 
            m.poster_url, 
            m.rating, 
            m.\`count\`
        FROM serie s 
        INNER JOIN movie m ON s.seasonid = m.id
        WHERE m.\`type\` = 'season' AND s.serieId = ?
        ORDER BY s.seasonnumber
    `;

    connection.query(query, [serieId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ data: results });
        }
    });
});

app.get('/movie/review', (req, res) => {
    const { id } = req.query;

    const query = `
        SELECT 
            s.seasonnumber, 
            s.seasontitle, 
            m.poster_url, 
            m.\`count\`,
            CASE WHEN m.\`count\` > 0 THEN m.rating / m.\`count\` ELSE 0 END AS average_rating
        FROM serie s 
        INNER JOIN movie m ON s.seasonid = m.id
        WHERE s.serieid = ? 
        ORDER BY s.seasonnumber
    `;

    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Fail to retrieve show review!' });
        } else {
            res.status(200).json({ data: results });
        }
    });
});


app.get('/movie/season/review', (req, res) => {
    const { id } = req.query;

    const query = `
        SELECT 
            s.episodenumber, 
            m.title, 
            m.poster_url, 
            CASE WHEN m.\`count\` > 0 THEN m.rating / m.\`count\` ELSE 0 END AS average_rating
        FROM season s 
        INNER JOIN movie m ON s.episodeid = m.id
        WHERE s.seasonid = ? 
        ORDER BY s.episodenumber
    `;

    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ data: results });
        }
    });
});

app.post('/movie/rating', (req, res) => {
    const { rating, id } = req.query;

    if (!id || !rating) {
        return res.status(400).json({ message: 'Missing required parameters: id and rating' });
    }

    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 10) {
        return res.status(400).json({ message: 'Invalid rating value. It should be between 0 and 10.' });
    }

    connection.query(
        `UPDATE movie SET rating = rating + ?, \`count\` = \`count\` + 1 WHERE id = ?`,
        [parsedRating, id],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                res.status(500).json({ message: 'Internal server error' });
            } else if (results.affectedRows === 0) {
                res.status(404).json({ message: 'Movie not found' });
            } else {
                res.status(200).json({ message: 'Rating updated successfully' });
            }
        }
    );
});

app.get('/movie/episodes/', (req, res) => {
    const { seasonId } = req.query;

    const query = `
        SELECT 
            s.episodeid,
            s.episodenumber, 
            m.synopsis, 
            m.poster_url,
            m.title,
            m.rating, 
            m.\`count\`
        FROM season s 
        INNER JOIN movie m ON s.episodeid = m.id
        WHERE m.\`type\` = 'episode' AND s.seasonid = ?
        ORDER BY s.episodenumber
    `;

    connection.query(query, [seasonId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ data: results });
        }
    });
})

app.get('/movie/video', (req, res) => {
    const { id } = req.query;

    connection.query(`SELECT video_url, \`type\` FROM movie WHERE id = ?`, [id], (err, result) => {
        if (err || result[0].video_url === "") {
            res.json({ data: { video_url: 'https://www.youtube.com/embed/bXykENe1wwY', type: result[0].type } });
        }
        else {
            res.json({ data: result[0] })
        }
    })
})

app.get('/movie/seasonepisodes', (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Episode ID is required' });
    }

    connection.query(
        `SELECT s.episodeid, s.episodenumber, m.poster_url
        FROM season s
        INNER JOIN movie m ON s.episodeid = m.id
        WHERE s.seasonid = (
            SELECT seasonid FROM season WHERE episodeid = ?    
        )
        ORDER BY s.episodenumber`,
        [id],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'Episodes not found' });
            }

            res.json(result);
        }
    );
});

app.get('/movie/next-episode', (req, res) => {
    const { id } = req.query;

    connection.query(`
        SELECT episodeid AS nextepisodeid
        FROM season
        WHERE seasonid = (
            SELECT seasonid
            FROM season
            WHERE episodeid = ?
        )
        AND episodenumber = (
            SELECT MIN(episodenumber)
            FROM season
            WHERE seasonid = (
                SELECT seasonid
                FROM season
                WHERE episodeid = ?
            )
            AND episodenumber > (
                SELECT episodenumber
                FROM season
                WHERE episodeid = ?
            )
        );
    `, [id, id, id], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No next episode found' });
        }

        res.json(results[0]);
    });
});


app.get('/movie/previous-episode', (req, res) => {
    const { id } = req.query;

    connection.query(`
        SELECT episodeid AS previousepisodeid
        FROM season
        WHERE seasonid = (
            SELECT seasonid
            FROM season
            WHERE episodeid = ?
        )
        AND episodenumber = (
            SELECT MAX(episodenumber)
            FROM season
            WHERE seasonid = (
                SELECT seasonid
                FROM season
                WHERE episodeid = ?
            )
            AND episodenumber < (
                SELECT episodenumber
                FROM season
                WHERE episodeid = ?
            )
        )
    `, [id, id, id], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No previous episode found' });
        }

        res.json(results[0]);
    });
});

app.get('/movie/marked', (req, res) => {
    const { userId } = req.query;

    connection.query(`SELECT m.id, m.title, m.poster_url
        FROM marked_movie mm 
        INNER JOIN movie m
        ON mm.movieid = m.id
        WHERE mm.userid = ?
        `, [userId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ data: results });
        }
    })
})

app.post('/movie/marked', (req, res) => {
    const { userId, movieId } = req.body;

    connection.query(`INSERT INTO marked_movie(movieid,userid) VALUES(?,?) ON DUPLICATE KEY UPDATE movieid = VALUES(movieid)`, [movieId, userId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ data: results, message: "Successfully marked movie to watch later!" });
        }
    })
})

app.delete('/movie/marked', (req, res) => {
    const { userId, movieId } = req.body;

    connection.query(`DELETE FROM marked_movie WHERE movieid = ? AND userid = ?`, [movieId, userId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ data: results, message: "Movie removed from your marked movies!" });
        }
    })
})

app.get('/watching-movie/detail', async (req, res) => {
    const { id } = req.query;

    try {
        const [movie] = await connection.promise().query(`SELECT title, type, synopsis, rating, \`count\`, release_year FROM movie WHERE id = ?`, [id]);

        if (!movie.length) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        if (movie[0].type.toLowerCase() === 'movie') {
            return res.status(200).json({ data: movie[0] });
        }

        const [season] = await connection.promise().query(`SELECT seasonid, episodenumber FROM season WHERE episodeid = ?`, [id]);

        if (!season.length) {
            return res.status(404).json({ message: 'Season not found' });
        }

        const [series] = await connection.promise().query(`SELECT s.serieid, s.seasonnumber, m.title FROM serie s INNER JOIN movie m ON s.serieid = m.id WHERE s.seasonid = ?`, [season[0].seasonid]);

        if (!series.length) {
            return res.status(404).json({ message: 'Series not found' });
        }

        return res.json({
            data: {
                title: movie[0].title,
                synopsis: movie[0].synopsis,
                seasonnumber: series[0].seasonnumber,
                episodenumber: season[0].episodenumber,
                showname: series[0].title,
                rating: movie[0].rating,
                count: movie[0].count,
                release_year: movie[0].release_year,
                serieid: series[0].serieid,
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/movie/watched', (req, res) => {
    const { movieId, userId } = req.body;

    connection.query(
        `INSERT INTO watched_movie(movieid, userid, timewatch) 
         VALUES(?, ?, CURRENT_TIMESTAMP) 
         ON DUPLICATE KEY UPDATE timewatch = CURRENT_TIMESTAMP`,
        [movieId, userId],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            } else {
                res.status(200).json({ data: result });
            }
        }
    );
});

app.get('/movie/watched', (req, res) => {
    const { userId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    connection.query(
        `SELECT COUNT(*) AS total 
         FROM watched_movie wm 
         WHERE wm.userid = ?`,
        [userId],
        (countErr, countResult) => {
            if (countErr) {
                console.error(countErr);
                res.status(500).json({ message: 'Internal server error' });
            } else {
                const totalMovies = countResult[0].total;
                const totalPages = Math.ceil(totalMovies / limit);

                connection.query(
                    `SELECT m.id, m.title, m.poster_url 
                     FROM movie m 
                     INNER JOIN watched_movie wm ON m.id = wm.movieid 
                     WHERE wm.userid = ? 
                     LIMIT ? OFFSET ?`,
                    [userId, parseInt(limit), parseInt(offset)],
                    (err, result) => {
                        if (err) {
                            console.error(err);
                            res.status(500).json({ message: 'Internal server error' });
                        } else {
                            res.status(200).json({
                                data: result,
                                totalMovies,
                                totalPages,
                                currentPage: parseInt(page),
                            });
                        }
                    }
                );
            }
        }
    );
});


app.get('/playlist', (req, res) => {
    const { userId } = req.query;

    connection.query(`SELECT id,name FROM playlist WHERE userid = ?`, [userId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ data: results });
        }
    })
})

app.post('/playlist', (req, res) => {
    const { userId, name } = req.body;

    connection.query(`INSERT INTO playlist(name,userid) VALUES(?,?) ON DUPLICATE KEY UPDATE userid = VALUES(userid)`, [name, userId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ data: results, message: "Successfully create a playlist!" });
        }
    })
})

app.delete('/playlist', (req, res) => {
    const { id } = req.body;

    connection.query(`DELETE FROM playlist WHERE id = ?`, [id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ data: results, message: "Successfully remove your playlist!" });
        }
    })
})

app.get('/playlist/movie', (req, res) => {
    const { playlistId } = req.query;

    connection.query(`
        SELECT m.* 
        FROM playlist_movie pm
        INNER JOIN movie m ON pm.movie_id = m.id 
        WHERE playlist_id = ?
        `, [playlistId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ data: results });
        }
    })
})

app.post('/playlist/movie', (req, res) => {
    const { playlistId, movieId } = req.body;

    connection.query(`INSERT INTO playlist_movie(playlist_id, movie_id) VALUES(?,?) ON DUPLICATE KEY UPDATE movie_id = VALUES(movie_id)`, [playlistId, movieId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ data: result });
        }
    })
})

app.delete('/playlist/movie', (req, res) => {
    const { playlistId, movieId } = req.body;

    connection.query(`DELETE FROM playlist_movie WHERE playlist_id = ? AND movie_id = ?`, [playlistId, movieId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ data: result });
        }
    })
})

app.get('/pay', async (req, res) => {
    try {
        const url = await paypal.createOrder();
        console.log("Redirecting to:", url);
        res.redirect(url);
    } catch (e) {
        console.error('Error creating PayPal order:', e);
        res.status(500).send('Error creating payment order.');
    }
});


app.get('/pay/success', async (req, res) => {
    try {
        const { token } = req.query;
        await paypal.captureOrder(token);
        res.redirect('http://localhost:3000/billings/success');
    } catch (error) {
        console.error('Error capturing payment:', error);
        res.redirect('http://localhost:3000/billings/fail');
    }
});

app.get('/pay/cancel', (req, res) => {
    res.redirect('http://localhost:3000/billings');
});

app.get('/pay/current-plan', (req, res) => {
    const userId = req.query.userId;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid or missing userId parameter' });
    }

    connection.query(
        'SELECT * FROM payment WHERE userid = ?',
        [userId],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (result.length > 0) {
                res.status(200).json({ isDiamondMember: true });
            } else {
                res.status(200).json({ isDiamondMember: false });
            }
        }
    );
});

app.delete('/pay/current-plan', (req, res) => {
    const userId = req.query.userId;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid or missing userId parameter' });
    }

    connection.query(`DELETE FROM payment WHERE userid = ?`, [userId], (err, result) => {
        if (err) {
            res.status(500).json({ message: "Server error" });
        } else {
            res.send();
        }
    })
})

app.post('/pay/current-plan', (req, res) => {
    const userId = req.body.userId;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid or missing userId parameter' });
    }

    const query = `INSERT INTO payment(userid) VALUES(?) 
                   ON DUPLICATE KEY UPDATE userid = VALUES(userid)`;

    connection.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'Membership updated successfully.' });
        } else {
            return res.status(500).json({ message: 'Unable to update membership.' });
        }
    });
});

app.get('/admin/users', (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 100;
    const offset = (page - 1) * limit;

    connection.query(
        `SELECT * FROM user ORDER BY id ASC LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Internal Server Error" });
            }

            connection.query(`SELECT COUNT(*) AS total FROM user`, (err, countResult) => {
                if (err) {
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                const totalUsers = countResult[0].total;
                const totalPages = Math.ceil(totalUsers / limit);

                res.json({
                    data: result,
                    meta: {
                        currentPage: page,
                        totalPages,
                        totalUsers,
                        perPage: limit,
                    },
                });
            });
        }
    );
});


app.post('/admin/user/send-email', async (req, res) => {
    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({ error: "Email and message are required" });
    }

    const mailOptions = {
        from: 'erinelinguester@gmail.com',
        to: email,
        subject: 'Email from Smothvie Admin',
        text: message,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.delete('/admin/user', (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const query = 'DELETE FROM user WHERE id = ?';

    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ error: 'Failed to delete user' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    });
});

app.get('/admin/movies')
app.put('/admin/movies')
app.post('/admin/movie')
app.put('/admin/movie')
app.post('/admin/season')
app.put('/admin/season')
app.post('/admin/episode')
app.put('/admin/episode')

app.post('/admin/actors')
app.put('/admin/actors')

app.post('/admin/genres')
app.put('/admin/genres')

app.get('/admin/comments', async (req, res) => {
    try {
        const commentQuery = `
            SELECT 
                c.commentid, 
                c.userid, 
                c.movieid, 
                c.comment, 
                c.hidden, 
                c.postdate, 
                u.username, 
                u.profile_picture
            FROM 
                comment c
            INNER JOIN 
                user u ON c.userid = u.id
            ORDER BY 
                c.postdate DESC;
        `;

        const hiddenReasonQuery = `
            SELECT 
                hc.commentid, 
                hc.reason
            FROM 
                hidden_comment hc;
        `;

        const queryAsync = (sql) => {
            return new Promise((resolve, reject) => {
                connection.query(sql, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        };

        const comments = await queryAsync(commentQuery);
        const hiddenReasons = await queryAsync(hiddenReasonQuery);

        const hiddenReasonMap = hiddenReasons.reduce((map, hr) => {
            if (!map[hr.commentid]) {
                map[hr.commentid] = [];
            }
            map[hr.commentid].push(hr.reason);
            return map;
        }, {});

        const results = comments.map((comment) => ({
            ...comment,
            hidden_reasons: hiddenReasonMap[comment.commentid] || [],
        }));

        res.status(200).json({
            data: results,
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            message: 'Failed to fetch comments.',
        });
    }
});

app.get('/admin/comments/reported', async (req, res) => {
    try {
        const queryAsync = (sql) => {
            return new Promise((resolve, reject) => {
                connection.query(sql, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        };

        const query = `
            SELECT c.*, u.username, u.profile_picture
            FROM comment c 
            INNER JOIN user u ON u.id = c.userid
            WHERE c.commentid IN (SELECT DISTINCT commentid FROM reported_comment)
        `;

        const reasonQuery = `
            SELECT * 
            FROM reported_comment
        `;

        const reportedComments = await queryAsync(query);
        const reasons = await queryAsync(reasonQuery);

        const reasonsMap = reasons.reduce((map, reason) => {
            if (!map[reason.commentid]) {
                map[reason.commentid] = [];
            }
            map[reason.commentid].push(reason.reason);
            return map;
        }, {});

        const mergedComments = reportedComments.map((comment) => ({
            ...comment,
            reasons: reasonsMap[comment.commentid] || [],
        }));

        res.json({
            success: true,
            data: mergedComments,
        });
    } catch (error) {
        console.error('Error fetching reported comments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reported comments.',
        });
    }
});

app.delete('/admin/comments', async (req, res) => {
    try {
        const { commentids } = req.body;

        if (!Array.isArray(commentids) || commentids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or empty commentids array.',
            });
        }

        const placeholders = commentids.map(() => '?').join(', ');
        const query = `DELETE FROM comment WHERE commentid IN (${placeholders})`;

        const result = await new Promise((resolve, reject) => {
            connection.query(query, commentids, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });

        res.status(200).json({
            success: true,
            message: `${result.affectedRows} comment(s) deleted successfully.`,
        });
    } catch (error) {
        console.error('Error deleting comments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete comments.',
        });
    }
});

app.delete('/admin/comment/hide', async (req, res) => {
    try {
        const comments = req.body;

        if (!Array.isArray(comments) || comments.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or empty comments array.',
            });
        }

        const updateCommentQuery = `UPDATE comment SET hidden = 1 WHERE commentid = ?`;
        const insertReasonQuery = `INSERT INTO hidden_comment (commentid, reason) VALUES (?, ?) ON DUPLICATE KEY UPDATE reason = VALUES(reason)`;

        await new Promise((resolve, reject) => {
            connection.beginTransaction(err => {
                if (err) reject(err);
                else resolve();
            });
        });

        for (const { commentid, reasons } of comments) {
            if (!commentid || !Array.isArray(reasons) || reasons.length === 0) {
                throw new Error(`Invalid commentid or reasons for commentid: ${commentid}`);
            }

            await new Promise((resolve, reject) => {
                connection.query(updateCommentQuery, [commentid], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            for (const reason of reasons) {
                await new Promise((resolve, reject) => {
                    connection.query(insertReasonQuery, [commentid, reason], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
            }
        }

        await new Promise((resolve, reject) => {
            connection.commit(err => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.status(200).json({
            success: true,
            message: `${comments.length} comment(s) updated and reasons added successfully.`,
        });
    } catch (error) {
        await new Promise((resolve, reject) => {
            connection.rollback(() => resolve());
        });

        console.error('Error hiding comments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to hide comments and insert reasons.',
        });
    }
});

app.delete('/admin/comments/reported/dismiss', async (req, res) => {
    const { commentids } = req.body;

    if (!Array.isArray(commentids) || commentids.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing comment IDs.",
        });
    }

    const query = `
        DELETE FROM reported_comment
        WHERE commentid IN (?)
    `;

    try {
        const [result] = await connection.promise().query(query, [commentids]);
        res.status(200).json({
            success: true,
            message: `${result.affectedRows} reported comments were successfully dismissed.`,
        });
    } catch (error) {
        console.error("Error rejecting reported comments:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject reported comments.",
        });
    }
});