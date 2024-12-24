import React, { useState } from 'react';
import PlaylistModal from './PlaylistModal';
import styles from './PlaylistButton.module.css';

const PlaylistButton = ({ movieId }) => {
    const userId = localStorage.getItem('id');
    const [isModalOpen, setModalOpen] = useState(false);

    const handleButtonClick = () => {
        if (userId) {
            setModalOpen(true);
        }
    };

    return (
        <>
            <div className={styles.container}>
                <button
                    onClick={handleButtonClick}
                    disabled={!userId}
                    className={userId ? styles.enabledButton : styles.disabledButton}
                >
                    {userId ? 'Add to playlists' : 'Login to add to playlist'}
                </button>
            </div>
            {isModalOpen && userId && (
                <PlaylistModal
                    userId={userId}
                    movieId={movieId}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </>
    );
};

export default PlaylistButton;
