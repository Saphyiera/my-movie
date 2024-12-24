import React, { useEffect, useState } from 'react';
import styles from './MarkedMovies.module.css';
import { useNavigate } from 'react-router-dom';

const MarkedMovies = () => {
    const [markedMovies, setMarkedMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const userId = localStorage.getItem('id');

    useEffect(() => {
        const fetchMarkedMovies = async () => {
            if (!userId) {
                setError('You must be logged in to view marked movies.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:2811/movie/marked?userId=${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setMarkedMovies(data.data || []);
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Failed to fetch marked movies.');
                }
            } catch (err) {
                console.error('Error fetching marked movies:', err);
                setError('An error occurred while fetching marked movies.');
            } finally {
                setLoading(false);
            }
        };

        fetchMarkedMovies();
    }, [userId]);

    const handleRemoveMovie = async (movieId) => {
        try {
            const response = await fetch('http://localhost:2811/movie/marked', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, movieId }),
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message); // Alert user of success
                setMarkedMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== movieId));
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to remove movie.');
            }
        } catch (err) {
            console.error('Error removing movie:', err);
            alert('An error occurred while removing the movie.');
        }
    };

    if (loading) {
        return <div className={styles.loader}>Loading...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Marked Movies</h2>
            {markedMovies.length > 0 ? (
                <div className={styles.movieList}>
                    {markedMovies.map((movie) => (
                        <div
                            key={movie.id}
                            className={styles.movieCard}
                        >
                            <img
                                src={movie.poster_url}
                                alt={movie.title}
                                className={styles.poster}
                                onClick={() => navigate(`/preview/${movie.id}`)}
                            />
                            <div className={styles.movieInfo}>
                                <p className={styles.movieTitle}>{movie.title}</p>
                                <button
                                    className={styles.removeButton}
                                    onClick={() => handleRemoveMovie(movie.id)}
                                >
                                    <span className={styles.removeIcon}>🗑️</span>
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className={styles.noMovies}>No marked movies found.</p>
            )}
        </div>
    );
};

export default MarkedMovies;
