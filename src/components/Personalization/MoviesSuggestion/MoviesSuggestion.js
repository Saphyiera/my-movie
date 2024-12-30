import React, { useState, useEffect } from "react";
import styles from "../../HomePage/MoviesSection/styles.module.css";
import { useNavigate } from "react-router-dom";

const MoviesSuggestion = () => {
    const [movies, setMovies] = useState([]);
    const [isDiamondMember, setIsDiamondMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuggestedMovies = async () => {
            try {
                const userId = localStorage.getItem("id");

                if (!userId) {
                    throw new Error("Please log in if you are a diamond member to get personalized suggestions.");
                }

                const membershipResponse = await fetch(
                    `http://localhost:2811/pay/current-plan?userId=${userId}`
                );
                if (!membershipResponse.ok) {
                    throw new Error("Failed to verify membership status.");
                }
                const membershipData = await membershipResponse.json();

                if (membershipData.isDiamondMember) {
                    setIsDiamondMember(true);

                    const suggestedMoviesResponse = await fetch(
                        `http://localhost:2812/suggest-movies/${userId}`
                    );
                    if (!suggestedMoviesResponse.ok) {
                        throw new Error("Failed to fetch suggested movies.");
                    }
                    const suggestedMoviesData = await suggestedMoviesResponse.json();
                    setMovies(suggestedMoviesData);
                } else {
                    throw new Error(
                        "Access restricted. Upgrade to a Diamond membership to view suggested movies."
                    );
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestedMovies();
    }, []);

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (isDiamondMember === false) {
        return <></>
    }

    if (error) {
        return <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Maybe You’re Interested</h2>
            </div>
            <div className={styles.errorMessage}>{error}</div>;
        </div>

    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Maybe You’re Interested</h2>
            </div>
            {movies.length > 0 ? (
                <div className={styles.rowContainer}>
                    {movies.map((movie) => (
                        <div key={movie.id} className={styles.itemContainer} onClick={() => navigate('/preview/' + movie.id)}>
                            <img
                                src={movie.poster_url}
                                alt={movie.title}
                                className={styles.poster}
                            />
                            <h3 className={styles.movie}>{movie.title}</h3>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No suggested movies found.</p>
            )}
        </div>
    );
};

export default MoviesSuggestion;
