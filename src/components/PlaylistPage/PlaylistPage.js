import React, { useEffect, useState } from 'react';
import styles from './PlaylistPage.module.css';
import Playlist from './Playlist/Playlist';

const PlaylistPage = () => {
    const userId = localStorage.getItem('id');
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newPlaylistName, setNewPlaylistName] = useState('');

    const fetchPlaylists = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

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

    const createPlaylist = async () => {
        if (!newPlaylistName.trim()) {
            alert('Please enter a playlist name');
            return;
        }

        try {
            const response = await fetch('http://localhost:2811/playlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    name: newPlaylistName,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Playlist created successfully!');
                setNewPlaylistName('');
                fetchPlaylists(); // Refresh playlists after creating a new one
            } else {
                console.error('Error creating playlist:', data.message || 'Failed to create playlist.');
                alert('Failed to create playlist.');
            }
        } catch (err) {
            console.error('Error creating playlist:', err);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, [userId]);

    return (
        <div className={styles.container}>
            {userId ? (
                <>
                    <h2 style={{ fontSize: '36px' }}>Your Playlists</h2>
                    <div className={styles.createPlaylistContainer}>
                        <h2>Create a new playlist: </h2>
                        <input
                            type="text"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            placeholder="Enter playlist name"
                            className={styles.playlistInput}
                        />
                        <button
                            className={styles.createPlaylistButton}
                            onClick={createPlaylist}
                        >
                            Create
                        </button>
                    </div>

                    {loading ? (
                        <div className={styles.loader}>Loading...</div>
                    ) : error ? (
                        <div className={styles.error}>{error}</div>
                    ) : playlists.length > 0 ? (
                        <div className={styles.playlistGrid}>
                            {playlists.map((playlist) => (
                                <Playlist
                                    playlistId={playlist.id}
                                    title={playlist.name}
                                    key={playlist.id + "+" + playlist.id}
                                    onDelete={() => setPlaylists(prev => prev.filter(i => i.id !== playlist.id))}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noPlaylists}>You have no playlists yet.</p>
                    )}
                </>
            ) : (
                <div className={styles.loginPrompt}>
                    <p>Please log in to see your playlists.</p>
                </div>
            )}
        </div>
    );
};

export default PlaylistPage;
