import { useEffect, useState } from 'react';
import styles from './styles.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import CommentSection from './CommentSection/CommentSection';
import SeasonSection from './SeasonSection/SeasonSection';
import MovieReviewModal from './Review/MovieReviewModal';
import RatingModal from '../Rating/RatingModal/RatingModal';
import MarkButton from '../MarkedMoviesPage/MarkButton/MarkButton';
import PlaylistButton from '../PlaylistPage/PlaylistModal/PlaylistButton';
import RelatedMovies from '../Personalization/RelatedMovies/RelatedMovies';

function Preview() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showRating, setShowRating] = useState(false);

    const navigate = useNavigate();

    const fetchMovieDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:2811/movie/details?id=${id}`);
            const data = await response.json();
            console.log(data);
            if (data.status === 200) {
                const movieData = data.data;
                setMovie({
                    type: movieData.movie.type,
                    id: movieData.movie.id,
                    title: movieData.movie.title,
                    synopsis: movieData.movie.synopsis,
                    release_year: movieData.movie.release_year,
                    poster_url: movieData.movie.poster_url,
                    video_url: movieData.movie.video_url,
                    rating: parseFloat(movieData.movie.rating / movieData.movie.count).toFixed(1),
                    count: movieData.movie.count,
                    actors: movieData.actors.map(actor => actor.name),
                    genres: movieData.genres.map(genre => genre.name),
                });
            }
        } catch (error) {
            console.error('Error fetching movie details:', error);
        } finally {
            setLoading(false);
        }
    }

    const watch = () => {
        navigate('/watch/' + movie.id);
    }

    useEffect(() => {
        fetchMovieDetails();
    }, [id]);

    if (loading) {
        return <p style={{ minHeight: '100vh' }}>Loading...</p>;
    }

    if (!movie) {
        return <p style={{ minHeight: '100vh' }}>Movie details not available.</p>;
    }

    const stars = Array.from({ length: 10 }, (_, i) => i < Math.floor(movie.rating));

    return (
        <>
            <div className={styles.imageContainer}>
                <div>
                    <img src={movie.poster_url} alt="Can't load image!" className={styles.preViewImage}></img>
                </div>
                <h2 className={styles.title}>{movie.title}</h2>
                <div className={styles.buttonRow}>
                    <MarkButton movieId={movie.id} />
                    <PlaylistButton movieId={movie.id} />
                </div>
            </div>
            <div className={styles.contentContainer}>
                <p className={styles.synopsis}>{movie.synopsis}</p>
                {
                    movie.type.toLowerCase() === 'movie' ?
                        <>
                            <button type='submit' className={styles.watchButton} onClick={watch}>Watch Now &gt;</button>
                            <p className={styles.releaseYear}>Release year: {movie.release_year}</p>
                        </>
                        :
                        <>
                            <button onClick={() => setShowModal(true)} className={styles.watchButton}>Overall</button>
                            {showModal && (
                                <MovieReviewModal
                                    movieTitle={movie.title}
                                    moviePoster={movie.poster_url}
                                    movieId={movie.id}
                                    onClose={() => setShowModal(false)}
                                />
                            )}
                        </>
                }
                <p className={styles.rating}>Rating:
                    {stars.map((star, index) => (
                        <span key={index} className="fa fa-star" style={star ? myStyles.starChecked : myStyles.starUnchecked}></span>
                    ))}
                    &#40;{movie.rating}/10&#41; by {movie.count} viewers.
                    <button className={styles.ratingButton} onClick={() => setShowRating(true)}>Rate</button>
                </p>
                {
                    showRating && <RatingModal movieId={movie.id} onClose={() => {
                        setShowRating(false)
                        fetchMovieDetails();
                    }} />
                }
                <div className={styles.actorsContainer}>
                    Actors: {movie.actors.map((actor, index) => (
                        <p key={index} className={styles.actor}>{actor}</p>
                    ))}
                </div>
                <div className={styles.genresContainer}>
                    Genres: {movie.genres.map((genre, index) => (
                        <p key={index} className={styles.genre}>{genre}</p>
                    ))}
                </div>
            </div >

            {
                movie.type === 'show' &&
                <SeasonSection serieId={movie.id} />
            }

            <CommentSection id={id} title="Reviews" />
            <RelatedMovies movieId={id} />
        </>
    );
}

const myStyles = {
    starChecked: {
        color: 'gold',
        padding: 3
    },
    starUnchecked: {
        padding: 3
    }
};

export default Preview;
