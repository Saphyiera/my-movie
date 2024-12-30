import React, { useState } from "react";
import styles from "./styles.module.css";

const HideCommentsButton = ({ comments, title }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState("");

    const handleHideComments = async () => {
        if (!Array.isArray(comments) || comments.length === 0) {
            setMessage("No comments to hide.");
            return;
        }

        setIsProcessing(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:2811/admin/comment/hide", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(comments),
            });

            const result = await response.json();

            if (result.success) {
                setMessage(result.message);
            } else {
                setMessage(result.message || "Failed to hide comments.");
            }
        } catch (error) {
            console.error("Error hiding comments:", error);
            setMessage("An unexpected error occurred.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={styles.hideCommentsContainer}>
            <button
                onClick={handleHideComments}
                disabled={isProcessing}
                className={styles.hideCommentsButton}
            >
                {isProcessing ? "Hiding..." : title}
            </button>
            {message && <div className={styles.message}>{message}</div>}
        </div>
    );
};

export default HideCommentsButton;
