import React, { useState, useEffect } from 'react';
import styles from './SeasonReviewModal.module.css';
import rottenIcon from './rotten.png';
import freshIcon from './fresh.png';

const SeasonReviewModal = ({ seasonTitle, seasonPoster, seasonId, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSeasonReviews = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:2811/movie/season/review?id=${seasonId}`);
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
        if (seasonId) {
            fetchSeasonReviews();
        }
    }, [seasonId]);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <div className={styles.header}>
                    <img src={seasonPoster} alt={`${seasonTitle} Poster`} className={styles.poster} />
                    <h2 className={styles.title}>{seasonTitle}</h2>
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
                                <div key={review.episodenumber} className={styles.reviewCard}>
                                    <p className={styles.episodeTitle}>Episode {review.episodenumber}</p>
                                    <img
                                        src={review.poster_url}
                                        alt={`Episode ${review.episodenumber} Poster`}
                                        className={styles.episodePoster}
                                    />
                                    <div className={styles.ratingContainer}>
                                        <strong>Average Rating:</strong>
                                        <span
                                            style={
                                                isFresh
                                                    ? { color: 'gold', fontWeight: '600' }
                                                    : { color: 'red', fontWeight: '600' }
                                            }
                                        >
                                            {parseFloat(review.average_rating).toFixed(2)}
                                        </span>
                                        <img
                                            src={isFresh ? freshIcon : rottenIcon}
                                            alt={isFresh ? 'Fresh' : 'Rotten'}
                                            className={styles.ratingIcon}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className={styles.noReviews}>No reviews found for this season.</p>
                )}
            </div>
        </div>
    );
};

export default SeasonReviewModal;
