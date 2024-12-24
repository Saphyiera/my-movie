import React, { useState, useEffect } from 'react';
import styles from './MovieReviewModal.module.css';
import rottenIcon from './rotten.png';
import freshIcon from './fresh.png';

const MovieReviewModal = ({ movieTitle, moviePoster, movieId, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReviews = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:2811/movie/review?id=${movieId}`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data.data);
            } else {
                setError("Failed to fetch reviews");
            }
        } catch (err) {
            setError("An error occurred while fetching reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (movieId) {
            fetchReviews();
        }
    }, [movieId]);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <div className={styles.header}>
                    <img src={moviePoster} alt={`${movieTitle} Poster`} className={styles.poster} />
                    <h2 className={styles.title}>{movieTitle}</h2>
                </div>
                {loading ? (
                    <p className={styles.loading}>Loading reviews...</p>
                ) : error ? (
                    <p className={styles.error}>{error}</p>
                ) : reviews.length > 0 ? (
                    <div className={styles.reviewContainer}>
                        {reviews.map((review) => {
                            const isFresh = parseFloat(review.average_rating) >= 6;
                            return (
                                <div key={review.seasonnumber} className={styles.reviewCard}>
                                    <p className={styles.seasonTitle}>{review.seasontitle}</p>
                                    <img
                                        src={review.poster_url}
                                        alt={`Season ${review.seasonnumber} Poster`}
                                        className={styles.seasonPoster}
                                    />
                                    <p className={styles.ratingContainer}>
                                        <strong>Average Rating:</strong>
                                        <p style={isFresh ? { color: 'gold', fontWeight: '600' } : { color: 'green', fontWeight: '600' }}>
                                            {parseFloat(review.average_rating).toFixed(2)}/10 by {review.count}
                                        </p>
                                        <img
                                            src={isFresh ? freshIcon : rottenIcon}
                                            alt={isFresh ? 'Fresh' : 'Rotten'}
                                            className={styles.ratingIcon}
                                        />
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className={styles.noReviews}>No reviews found for this movie.</p>
                )}
            </div>
        </div>
    );
};

export default MovieReviewModal;
