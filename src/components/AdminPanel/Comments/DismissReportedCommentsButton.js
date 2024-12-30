import React, { useState } from "react";
import styles from "./styles.module.css";

const DismissReportedCommentsButton = ({ commentids, title }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState("");

    const handleDismissComments = async () => {
        if (!Array.isArray(commentids) || commentids.length === 0) {
            setMessage("No reported comments to dismiss.");
            return;
        }

        setIsProcessing(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:2811/admin/comments/reported/dismiss", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ commentids }),
            });

            const result = await response.json();

            if (result.success) {
                setMessage(result.message);
            } else {
                setMessage(result.message || "Failed to dismiss reported comments.");
            }
        } catch (error) {
            console.error("Error dismissing reported comments:", error);
            setMessage("An unexpected error occurred.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={styles.dismissCommentsContainer}>
            <button
                onClick={handleDismissComments}
                disabled={isProcessing}
                className={styles.dismissCommentsButton}
            >
                {isProcessing ? "Dismissing..." : title}
            </button>
            {message && <div className={styles.message}>{message}</div>}
        </div>
    );
};

export default DismissReportedCommentsButton;
