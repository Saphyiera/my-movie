import React, { useEffect, useState } from 'react';
import styles from './Playlist.module.css';
import { useNavigate } from 'react-router-dom';

const Playlist = ({ playlistId, title, onDelete }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showMovies, setShowMovies] = useState(false);
    const navigate = useNavigate();

    const fetchMovies = async () => {
        try {
            const response = await fetch(`http://localhost:2811/playlist/movie?playlistId=${playlistId}`);
            if (response.ok) {
                const data = await response.json();
                setMovies(data.data || []);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch movies.');
            }
        } catch (err) {
            console.error('Error fetching movies:', err);
            setError('An error occurred while fetching movies.');
        } finally {
            setLoading(false);
        }
    };

    const removeMovie = async (movieId) => {
        try {
            const response = await fetch(`http://localhost:2811/playlist/movie`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playlistId, movieId }),
            });

            if (response.ok) {
                setMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== movieId));
                alert('Successfully removed from playlist')
            } else {
                const errorData = await response.json();
                console.error('Error removing movie:', errorData.message || 'Failed to remove movie.');
                alert('Failed to remove movie.');
            }
        } catch (err) {
            console.error('Error removing movie:', err);
        }
    };

    const removePlaylist = async () => {
        try {
            const response = await fetch(`http://localhost:2811/playlist`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: playlistId }),
            });

            if (response.ok) {
                alert('Playlist successfully removed');
                if (onDelete) {
                    onDelete();
                }
            } else {
                const errorData = await response.json();
                console.error('Error removing playlist:', errorData.message || 'Failed to remove playlist. Maybe try to remove all movies from that playlist first!');
                alert('Failed to remove playlist.');
            }
        } catch (err) {
            console.error('Error removing playlist:', err);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header} onClick={() => setShowMovies(!showMovies)}>
                <h2 className={styles.title}>{title || 'Playlist Movies'}</h2>
            </div>
            {loading ? (
                <div className={styles.loader}>Loading...</div>
            ) : error ? (
                <div className={styles.error}>{error}</div>
            ) : movies.length > 0 ? (
                showMovies ?
                    <ul className={styles.movieList}>
                        {movies.map((movie) => (
                            <li key={movie.id + "-" + playlistId} className={styles.movieItem}>
                                <div className={styles.movieDetails} onClick={() => navigate(`/preview/${movie.id}`)}>
                                    <img src={movie.poster_url} alt='Cant load image' className={styles.movieImage} />
                                    <div className={styles.movieText}>
                                        <h3>{movie.title}</h3>
                                        <p>{movie.description}</p>
                                    </div>
                                </div>
                                <button
                                    className={styles.removeButton}
                                    onClick={() => removeMovie(movie.id)}
                                >
                                    Remove from playlist
                                </button>
                            </li>
                        ))}
                    </ul> :
                    <p className={styles.noMovies}>Click to see playlist movies</p>
            ) : (
                <p className={styles.noMovies}>No movies in this playlist.</p>
            )}
            <button
                className={styles.removePlaylistButton}
                onClick={removePlaylist}
            >
                Remove Playlist
            </button>
        </div>
    );
};

export default Playlist;
