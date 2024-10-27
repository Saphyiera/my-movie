const mysql = require('mysql2')
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
    console.log("Connected");
})

const query = 'select * from movie';
connection.query(query, (req, res) => {
    res.send(res)
})


