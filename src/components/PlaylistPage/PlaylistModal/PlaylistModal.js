import React, { useEffect, useState } from 'react';
import styles from './PlaylistModal.module.css';

const PlaylistModal = ({ userId, onClose, movieId }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchPlaylists = async () => {
        try {
            const response = await fetch(`http://localhost:2811/playlist?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setPlaylists(data.data || []);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch playlists.');
            }
        } catch (err) {
            console.error('Error fetching playlists:', err);
            setError('An error occurred while fetching playlists.');
        } finally {
            setLoading(false);
        }
    };

    const addToPlaylist = async (playlistId) => {
        try {
            const response = await fetch(`http://localhost:2811/playlist/movie`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playlistId, movieId }),
            });

            if (response.ok) {
                setSuccessMessage('Movie added to playlist successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to add movie to playlist.');
            }
        } catch (err) {
            console.error('Error adding movie to playlist:', err);
            setError('An error occurred while adding the movie to the playlist.');
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <h2 className={styles.title}>Your Playlists</h2>
                {loading ? (
                    <div className={styles.loader}>Loading...</div>
                ) : error ? (
                    <div className={styles.error}>{error}</div>
                ) : (
                    <>
                        {successMessage && <div className={styles.success}>{successMessage}</div>}
                        {playlists.length > 0 ? (
                            <ul className={styles.playlistList}>
                                {playlists.map((playlist) => (
                                    <li key={playlist.id} className={styles.playlistItem}>
                                        <span>{playlist.name}</span>
                                        <button
                                            className={styles.addButton}
                                            onClick={() => addToPlaylist(playlist.id)}
                                        >
                                            +
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={styles.noPlaylists}>No playlists found. Create a playlist first!</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PlaylistModal;
