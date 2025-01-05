const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const { checkAndGenerateKeyPair, PUBLIC_KEY_FILE } = require('./keyGen.js');
require('dotenv').config()
const connection = require('./db/connect.js');

const Actor = require('./controllers/Actor.js')
const Comment = require('./controllers/Comment.js')
const DiamondMember = require('./controllers/DiamondMember.js')
const Episode = require('./controllers/Episode.js')
const Genre = require('./controllers/Genre.js')
const MarkedMovies = require('./controllers/MarkedMovies.js')
const Movie = require('./controllers/Movie.js')
const MovieDetails = require('./controllers/MovieDetails.js')
const Playlist = require('./controllers/Playlist.js')
const Season = require('./controllers/Season.js')
const User = require('./controllers/User.js')
const WatchedMovie = require('./controllers/WatchedMovie.js')

const actorController = new Actor();
const commentController = new Comment();
const diamondMemberController = new DiamondMember();
const episodeController = new Episode();
const genreController = new Genre();
const markedMoviesController = new MarkedMovies();
const movieController = new Movie();
const movieDetailsController = new MovieDetails();
const playlistController = new Playlist();
const seasonController = new Season();
const userController = new User();
const watchedMovieController = new WatchedMovie();

checkAndGenerateKeyPair();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express()
const port = process.env.SERVER_PORT || 2811

app.use(express.json());
app.use(cors());

app.listen(
    port,
    () => {
        console.log(`Server is running on port ${port}`);
    }
)

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

app.get('/', (req, res) => movieController.getAllMovies(req, res));
app.get('/movie', (req, res) => movieController.getMovie(req, res));

app.post('/signup', (req, res) => userController.signup(req, res));
app.post('/login', (req, res) => userController.login(req, res))
app.get('/user', (req, res) => userController.getById(req, res));
app.post('/user/verify-email', (req, res) => userController.verifyEmail(req, res));
app.get('/user/verify', (req, res) => userController.verify(req, res));
app.post('/user/profile-picture', upload.single('image'), async (req, res) => userController.updateProfilePicture(req, res));
app.post('/user/info', (req, res) => userController.updateInfo(req, res))
app.post('/user/email', (req, res) => userController.updateEmail(req, res));

app.post('/movie', (req, res) => movieController.insertMovie(req, res));
app.post('/update/movie', (req, res) => movieController.updateMovie(req, res));

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

app.post('/actor', (req, res) => actorController.insertActor(req, res));
app.post('/movie-actor', (req, res) => actorController.insertMovieActor(req, res));
app.post('/genre', (req, res) => genreController.insertGenre(req, res));
app.post('/movie-genre', (req, res) => genreController.insertMovieGenre(req, res));


app.get('/movie/count', (req, res) => movieController.countMovies(req, res));
app.get('/suggestions/recent', (req, res) => movieController.suggestRecentMovies(req, res));
app.get('/suggestions/rating', (req, res) => movieController.suggestHighRatedMovies(req, res));
app.get('/suggestions/all', (req, res) => movieController.getAllMoviesv2(req, res));

app.get('/genres/all', (req, res) => genreController.getAllGenres(req, res));

app.get('/actors/all', (req, res) => actorController.getAllActors(req, res));

app.post('/get/movies/actor', (req, res) => movieController.getmoviesByActors(req, res));
app.post('/get/movies/genre', (req, res) => movieController.getMoviesByGenres(req, res));
app.post('/get/movie/title', (req, res) => movieController.getMovieByTitleV2(req, res));

app.get('/movie/details', (req, res) => movieDetailsController.getById(req, res));
app.get('/movie/comments', (req, res) => commentController.getMovieComments(req, res));
app.post('/movie/comment/', (req, res) => commentController.postComment(req, res));
app.post('/movie/comment/hide', (req, res) => commentController.hideComment(req, res))
app.post('/movie/comment/report', (req, res) => commentController.reportComment(req, res));
app.delete('/movie/comment', (req, res) => commentController.deleteComment(req, res));

app.get('/movie/seasons', (req, res) => seasonController.getShowSeasons(req, res));
app.get('/movie/review', (req, res) => seasonController.getShowReview(req, res));

app.post('/movie/rating', (req, res) => movieController.rateMovie(req, res));

app.get('/movie/season/review', (req, res) => episodeController.getSeasonReview(req, res));
app.get('/movie/episodes/', (req, res) => episodeController.getSeasonEpisodesDetails(req, res));
app.get('/movie/seasonepisodes', (req, res) => episodeController.getSeasonEpisode(req, res));
app.get('/movie/next-episode', (req, res) => episodeController.getNextEpisode(req, res));
app.get('/movie/previous-episode', (req, res) => episodeController.getPreviousEpisode(req, res));

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

app.get('/movie/marked', (req, res) => markedMoviesController.getUserMarkedMovies(req, res))
app.post('/movie/marked', (req, res) => markedMoviesController.markMovie(req, res))
app.delete('/movie/marked', (req, res) => markedMoviesController.unmarkMovie(req, res))

app.get('/watching-movie/detail', async (req, res) => movieController.getWatchingMovieDetails(req, res));

app.post('/movie/watched', (req, res) => watchedMovieController.insertWatchedMovie(req, res));
app.get('/movie/watched', (req, res) => watchedMovieController.getUserWatchedMovies(req, res));

app.get('/playlist', (req, res) => playlistController.getOwnerPlaylists(req, res))
app.post('/playlist', (req, res) => playlistController.createPlaylist(req, res));
app.delete('/playlist', (req, res) => playlistController.deletePlaylist(req, res));
app.get('/playlist/movie', (req, res) => playlistController.getById(req, res));
app.post('/playlist/movie', (req, res) => playlistController.addMovieToPlaylist(req, res));
app.delete('/playlist/movie', (req, res) => playlistController.removeMovieFromPlaylist(req, res));

app.get('/pay', async (req, res) => userController.pay(req, res));
app.get('/pay/success', async (req, res) => userController.paymentSuccess(req, res));
app.get('/pay/cancel', (req, res) => { userController.paymentCancel(req, res) });

app.get('/pay/current-plan', (req, res) => diamondMemberController.currentPlan(req, res));
app.delete('/pay/current-plan', (req, res) => diamondMemberController.cancelPlan(req, res));
app.post('/pay/current-plan', (req, res) => diamondMemberController.upgradePlan(req, res));

app.get('/admin/users', (req, res) => userController.getAllUsers(req, res));
app.post('/admin/user/reset-password', (req, res) => userController.changePassword(req, res));
app.post('/admin/user/send-email', async (req, res) => userController.sendAdminEmail(req, res));
app.delete('/admin/user', (req, res) => userController.deleteUser(req, res));

app.get('/admin/comments', async (req, res) => commentController.getAllComments(req, res));
app.get('/admin/comments/reported', async (req, res) => commentController.getAllReportedComments(req, res));
app.delete('/admin/comments', async (req, res) => commentController.deleteMultipleComments(req, res));
app.delete('/admin/comment/hide', async (req, res) => commentController.hideMultipleComments(req, res));
app.delete('/admin/comments/reported/dismiss', async (req, res) => commentController.confirmDeleteReportedComments(req, res));