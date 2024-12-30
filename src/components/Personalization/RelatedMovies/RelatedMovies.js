import React, { useEffect, useState } from "react";
import styles from "./RelatedMovies.module.css";
import { useNavigate } from "react-router-dom";

const RelatedMovies = ({ movieId }) => {
    const [movies, setMovies] = useState([]);
    const [isDiamondMember, setIsDiamondMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRelatedMovies = async () => {
            try {
                const userId = localStorage.getItem("id");

                if (!userId) {
                    throw new Error("You haven't logged in yet! Login to see related movies if you are a diamond member.");
                }

                const membershipResponse = await fetch(`http://localhost:2811/pay/current-plan?userId=${userId}`);
                if (!membershipResponse.ok) {
                    throw new Error("Failed to verify membership status.");
                }
                const membershipData = await membershipResponse.json();

                if (membershipData.isDiamondMember) {
                    setIsDiamondMember(true);

                    const relatedMoviesResponse = await fetch(`http://localhost:2812/related-movies/${movieId}`);
                    if (!relatedMoviesResponse.ok) {
                        throw new Error("Failed to fetch related movies.");
                    }
                    const relatedMoviesData = await relatedMoviesResponse.json();

                    setMovies(relatedMoviesData);
                } else {
                    throw new Error(
                        "Access restricted. Upgrade to a Diamond membership to view related movies."
                    );
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedMovies();
    }, [movieId]);

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (error) {
        return <div className={styles.container}>
            <h2 className={styles.title}>Related Movies</h2>
            <div className={styles.error}>{error}</div>;
        </div>

    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Related Movies</h2>
            {movies.length > 0 ? (
                <div className={styles.movieList}>
                    {movies.map((movie) => (
                        <div key={movie.id} className={styles.movieCard} onClick={() => navigate('/preview/' + movie.id)}>
                            <img src={movie.poster_url} alt={movie.title} />
                            <h3>{movie.title}</h3>
                            <p>Rating: {parseFloat(movie.avg_rating).toFixed(1)}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No related movies found.</p>
            )}
        </div>
    );
};

export default RelatedMovies;
