import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { useNavigate } from 'react-router-dom';

const SeasonSection = ({ serieId, title }) => {
    const navigate = useNavigate();

    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSeasons = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:2811/movie/seasons?serieId=${serieId}`);
            if (response.ok) {
                const data = await response.json();
                setSeasons(data.data);
            } else {
                setError("Failed to fetch seasons");
            }
        } catch (err) {
            setError("An error occurred while fetching seasons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (serieId) {
            fetchSeasons();
        }
    }, [serieId]);

    if (loading) return <div className={styles.loading}>Loading seasons...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;

    return (
        <div className={styles.seasonSection}>
            <h2 className={styles.seasonSectionTitle}>{title || "Seasons"}</h2>
            {seasons.length > 0 ? (
                <ul className={styles.seasonList}>
                    {seasons.map((season, index) => (
                        <li key={season.seasonid} className={styles.seasonItem}>
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
                                        <strong>Rating:</strong> {Math.floor(season.rating / season.count)} <span className="fa fa-star" style={{ color: "gold" }}></span> by {season.count} users
                                    </p>
                                    <button key={index} className={styles.watchButton} onClick={() => navigate(`/season/${season.seasonid}`, { state: season })}>Details</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.noSeasons}>No seasons found for this series.</p>
            )}
        </div>
    );
};

export default SeasonSection;
