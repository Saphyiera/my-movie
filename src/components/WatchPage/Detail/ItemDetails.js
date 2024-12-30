import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import RatingModal from "../../Rating/RatingModal/RatingModal";

const ItemDetails = ({ id }) => {
    const [itemData, setItemData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRating, setShowRating] = useState(false);

    const navigate = useNavigate();

    const fetchItemDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:2811/watching-movie/detail?id=${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch movie details");
            }

            const data = await response.json();
            setItemData(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItemDetails();
    }, [id]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <span className={styles.spinner}></span>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>⚠ Error: {error}</p>
            </div>
        );
    }

    if (!itemData) {
        return (
            <div className={styles.noData}>
                <p>🔍 No data available for this item.</p>
            </div>
        );
    }

    return (
        <div className={styles.itemDetailsContainer}>
            <div className={styles.itemHeader}>
                <h2 className={styles.itemTitle}>{itemData.title}</h2>
            </div>

            <div className={styles.itemInfo}>
                <p><strong>Synopsis:</strong> {itemData.synopsis}</p>
                <p><strong>Rating:</strong> {parseFloat(itemData.rating / itemData.count).toFixed(1)} from {itemData.count} ratings</p>
                {
                    itemData.type && itemData.type.toLowerCase() === "movie" &&
                    <button
                        className={styles.seasonsButton}
                        onClick={() => navigate(`/preview/${id}`)}
                    >
                        View Movie Details
                    </button>
                }
            </div>

            {itemData.seasonnumber && (
                <div className={styles.seasonInfo}>
                    <p><strong>Show Name:</strong> {itemData.showname}</p>
                    <p><strong>Season </strong> {itemData.seasonnumber}</p>
                    <p><strong>Episode </strong> {itemData.episodenumber}</p>
                    <div className={styles.buttonGroup}>
                        <button className={styles.rateButton} onClick={() => setShowRating(true)}>Rate</button>
                        <button
                            className={styles.seasonsButton}
                            onClick={() => navigate(`/preview/${itemData.serieid}`)}
                        >
                            View Show Details
                        </button>
                    </div>
                </div>
            )}
            {
                showRating && <RatingModal movieId={id} onClose={() => { setShowRating(false); fetchItemDetails() }} title="Rate this episode" />
            }
        </div>
    );
};

export default ItemDetails;
