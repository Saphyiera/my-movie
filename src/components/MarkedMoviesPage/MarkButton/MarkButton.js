import React, { useState } from 'react';
import styles from './MarkButton.module.css';

const MarkButton = ({ movieId }) => {
    const userId = localStorage.getItem('id');
    const [isMarked, setIsMarked] = useState(false);
    const [message, setMessage] = useState('');

    const handleMarkMovie = async () => {
        if (!userId) return;

        try {
            const response = await fetch('http://localhost:2811/movie/marked', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, movieId }),
            });

            if (response.ok) {
                const result = await response.json();
                setMessage(result.message || 'Movie marked successfully!');
                setIsMarked(true);
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to mark movie.');
            }
        } catch (err) {
            console.error('Error marking movie:', err);
            setMessage('An error occurred while marking the movie.');
        }
    };

    if (!userId) {
        return <div />;
    }

    return (
        <div className={styles.markButtonContainer}>
            <button
                className={styles.markButton}
                onClick={handleMarkMovie}
                disabled={isMarked}
            >
                {isMarked ? 'Marked' : 'Mark to watch later'}
            </button>
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
};

export default MarkButton;
