import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

const EpisodeNavigation = ({ id }) => {
    const [nextEpisode, setNextEpisode] = useState(null);
    const [prevEpisode, setPrevEpisode] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEpisodes = async () => {
            try {
                setLoading(true);

                const nextResponse = await fetch(`http://localhost:2811/movie/next-episode?id=${id}`);
                const nextData = await nextResponse.json();

                const prevResponse = await fetch(`http://localhost:2811/movie/previous-episode?id=${id}`);
                const prevData = await prevResponse.json();

                setNextEpisode(nextData[0].nextepisodeid || null);
                setPrevEpisode(prevData[0].previousepisodeid || null);
            } catch (error) {
                console.error('Error fetching episode data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEpisodes();
    }, [id]);

    return (
        <div className={styles.navigationContainer}>
            <button
                className={styles.navButton}
                disabled={!prevEpisode || loading}
                onClick={() => navigate(`/watch/${prevEpisode}`)}
            >
                Prev
            </button>
            <button
                className={styles.navButton}
                disabled={!nextEpisode || loading}
                onClick={() => navigate(`/watch/${nextEpisode}`)}
            >
                Next
            </button>
        </div>
    );
};

export default EpisodeNavigation;
