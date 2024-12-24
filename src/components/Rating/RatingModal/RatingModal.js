import React, { useState } from 'react';
import styles from './RatingModal.module.css';

const RatingModal = ({ movieId, onClose, title }) => {
    const [rating, setRating] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [disable, setDisable] = useState(false);

    const userId = localStorage.getItem('id');

    const submitRating = async () => {
        if (rating === null) {
            setStatusMessage('Please select a rating.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:2811/movie/rating?id=${movieId}&rating=${rating}`, {
                method: 'POST',
            });

            if (response.ok) {
                setStatusMessage('Rating submitted successfully!');
                setDisable(true);

            } else {
                const errorData = await response.json();
                setStatusMessage(errorData.message || 'Failed to submit rating.');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            setStatusMessage('An error occurred. Please try again.');
        }
    };

    const getRatingDetails = (ratingValue) => {
        if (ratingValue <= 3) {
            return { text: 'Poor', color: 'red', fontWeight: '600' };
        } else if (ratingValue <= 6) {
            return { text: 'Mid', color: 'orange', fontWeight: '600' };
        } else if (ratingValue <= 8) {
            return { text: 'OK', color: 'blue', fontWeight: '600' };
        } else {
            return { text: 'Excellent', color: 'green', fontWeight: '600' };
        }
    };

    const ratingDetails = rating !== null ? getRatingDetails(rating) : null;

    return (
        <div className={styles.modalOverlay}>
            {
                userId ?
                    <div className={styles.modal}>
                        <button className={styles.closeButton} onClick={onClose}>
                            &times;
                        </button>
                        <h2 className={styles.title}> {title || 'Rate the Movie'}</h2>
                        <div className={styles.ratingSection}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                                <button
                                    key={value}
                                    className={`${styles.ratingButton} ${rating === value ? styles.selected : ''}`}
                                    onClick={() => setRating(value)}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                        {ratingDetails && (
                            <div className={styles.ratingDetails}>
                                <span style={{ color: ratingDetails.color }}>{ratingDetails.text}</span>
                            </div>
                        )}
                        <button className={styles.submitButton} onClick={submitRating} disabled={disable} style={disable ? { backgroundColor: 'gray' } : {}}>
                            Submit Rating
                        </button>
                        {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}
                    </div>
                    : <div className={styles.modal}>
                        <button className={styles.closeButton} onClick={onClose}>
                            &times;
                        </button>
                        <p className={styles.mustLoginText}>You must login to rate this movie!</p>
                    </div>
            }
        </div>
    );
};

export default RatingModal;
