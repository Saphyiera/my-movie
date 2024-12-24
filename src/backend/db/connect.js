const mysql = require('mysql2')
require('dotenv').config()

const connection = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: 'movie'
    }
)

connection.connect((error) => {
    if (error) {
        console.log("Cant connect to movie database!")
    };
    console.log("Connected to movie database!");
})

module.exports = connection;