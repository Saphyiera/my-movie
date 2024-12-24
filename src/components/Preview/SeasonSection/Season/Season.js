import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CommentSection from '../../CommentSection/CommentSection';
import SeasonReviewModal from '../../Review/SeasonReviewModal';
import RatingModal from '../../../Rating/RatingModal/RatingModal'

const Season = () => {
    const { id } = useParams();
    const seasonId = id;

    const location = useLocation();
    const { state } = location;
    const season = state;

    const navigate = useNavigate();

    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReview, setShowReview] = useState(false);
    const [showRating, setShowRating] = useState(false);

    const fetchEpisodes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:2811/movie/episodes?seasonId=${seasonId}`);
            if (response.ok) {
                const data = await response.json();
                setEpisodes(data.data);
            } else {
                setError("Failed to fetch episodes");
            }
        } catch (err) {
            setError("An error occurred while fetching episodes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (seasonId) {
            fetchEpisodes();
        }
    }, [seasonId]);

    if (loading) return <div className={styles.loading}>Loading episodes...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;

    return (<>
        <div className={styles.season}>
            <div className={styles.seasonCard}>
                <img
                    src={season.poster_url}
                    alt={`${season.seasontitle} poster`}
                    className={styles.seasonPoster}
                />
                <div className={styles.seasonCardContent}>
                    <h3 className={styles.seasonTitle}>{season.seasontitle}</h3>
                    <p className={styles.seasonSynopsis}>
                        {season.synopsis}
                    </p>
                    <p className={styles.seasonInfo}>
                        <strong>Year:</strong> {season.release_year}
                    </p>
                    <p className={styles.seasonInfo}>
                        <strong>Rating:</strong> {Math.floor(season.rating / season.count)}{" "}
                        <span className="fa fa-star" style={{ color: "gold" }}></span> by {season.count} users
                    </p>
                    <button onClick={() => setShowReview(true)} className={styles.button}>Overview</button>
                    <button onClick={() => setShowRating(true)} className={styles.button} style={{ marginLeft: '10px' }}>Rate this season</button>
                </div>
            </div>
            {
                showRating && <RatingModal movieId={seasonId} title="Rate this season" onClose={() => {
                    setShowRating(false);
                }}
                />
            }
            {
                showReview && <SeasonReviewModal onClose={() => setShowReview(false)} seasonId={seasonId} seasonPoster={season.poster_url} seasonTitle={season.seasontitle} />
            }
            {episodes.length > 0 ? (
                <ul className={styles.episodeList}>
                    {episodes.map((episode) => (
                        <li key={episode.episodeid} className={styles.episodeItem}>
                            <div className={styles.row}>
                                <img
                                    src={episode.poster_url}
                                    alt={`Episode ${episode.episodenumber} poster`}
                                    className={styles.episodeImage}
                                />
                                <div className={styles.episodeContent}>
                                    <h3 className={styles.episodeTitle}>Episode {episode.episodenumber}. {episode.title}</h3>
                                    <p className={styles.synopsis}>
                                        {episode.synopsis}
                                    </p>
                                    <p className={styles.info}>
                                        <strong>Rating:</strong> {Math.floor(episode.rating / episode.count)} <span className="fa fa-star" style={{ color: "gold" }}></span> by {episode.count} users
                                    </p>
                                </div>
                                <div className={styles.watchButtonContainer}>
                                    <button onClick={() => navigate('/watch/' + episode.episodeid)} className={styles.watchButton}>Watch</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.noEpisodes}>No episodes found for this season.</p>
            )}
        </div>
        <CommentSection id={seasonId} title="Season Reviews" /></>
    );
};

export default Season;
