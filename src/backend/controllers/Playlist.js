const connection = require('../db/connect')
const Base = require('./Base')

class Playlist extends Base {
    constructor(id, name, userid, movies) {
        super(id);
        this.name = name;
        this.userid = userid;
        this.movies = movies;
    }

    getOwnerPlaylists(req, res) {
        const { userId } = req.query;

        connection.query(`SELECT id,name FROM playlist WHERE userid = ?`, [userId], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            } else {
                res.status(200).json({ data: results });
            }
        })
    }

    createPlaylist(req, res) {
        const { userId, name } = req.body;

        connection.query(`INSERT INTO playlist(name,userid) VALUES(?,?) ON DUPLICATE KEY UPDATE userid = VALUES(userid)`, [name, userId], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            } else {
                res.status(200).json({ data: results, message: "Successfully create a playlist!" });
            }
        })
    }

    deletePlaylist(req, res) {
        const { id } = req.body;

        connection.query(`DELETE FROM playlist WHERE id = ?`, [id], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            } else {
                res.status(200).json({ data: results, message: "Successfully remove your playlist!" });
            }
        })
    }

    getById(req, res) {
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
    }

    addMovieToPlaylist(req, res) {
        const { playlistId, movieId } = req.body;

        connection.query(`INSERT INTO playlist_movie(playlist_id, movie_id) VALUES(?,?) ON DUPLICATE KEY UPDATE movie_id = VALUES(movie_id)`, [playlistId, movieId], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            } else {
                res.status(200).json({ data: result });
            }
        })
    }

    removeMovieFromPlaylist(req, res) {
        const { playlistId, movieId } = req.body;

        connection.query(`DELETE FROM playlist_movie WHERE playlist_id = ? AND movie_id = ?`, [playlistId, movieId], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal server error' });
            } else {
                res.status(200).json({ data: result });
            }
        })
    }


}

module.exports = Playlist