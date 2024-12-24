import { useEffect, useState } from 'react';
import styles from './styles.module.css';
import { useNavigate } from 'react-router-dom';
import EpisodeNavigation from './EpisodeNavigation';

const Episodes = ({ id }) => {
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchEpisodes = async () => {
            try {
                const response = await fetch(`http://localhost:2811/movie/seasonepisodes?id=${id}`);

                if (!response.ok) {
                    throw new Error('Failed to load episodes');
                }

                const data = await response.json();
                setEpisodes(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load episodes');
                setLoading(false);
            }
        };

        fetchEpisodes();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className={styles.episodesContainer}>
            <EpisodeNavigation id={id} />
            <h2 className={styles.episodesTitle}>Episodes</h2>
            {episodes.length > 0 ? (
                <ul className={styles.episodesList}>
                    {episodes.map((episode) => (
                        <li
                            key={episode.episodeid}
                            className={`${styles.episodeItem} ${episode.episodeid === id ? styles.disabled : ''}`}
                            onClick={() => {
                                if (episode.episodeid !== id) {
                                    navigate('/watch/' + episode.episodeid);
                                }
                            }}
                            style={episode.episodeid == id ? { backgroundColor: 'lightgray' } : {}}
                        >
                            <div className={styles.episodeNumber}>Episode {episode.episodenumber}</div>
                            {episode.poster_url && (
                                <img
                                    src={episode.poster_url}
                                    alt={`Episode ${episode.episodenumber}`}
                                    className={styles.episodePoster}
                                />
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <div>No episodes found</div>
            )}
        </div>
    );
};

export default Episodes;
