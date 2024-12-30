import React, { useState } from "react";
import styles from "./SendAdminMailModal.module.css";

const SendAdminMailModal = ({ email, onClose }) => {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch("http://localhost:2811/admin/user/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, message }),
            });

            if (!response.ok) {
                throw new Error("Failed to send email");
            }

            setSuccess(true);
            setMessage("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Send Email to {email}</h2>
                <form onSubmit={handleSendEmail} className={styles.form}>
                    <textarea
                        className={styles.textarea}
                        placeholder="Enter your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    ></textarea>
                    {error && <p className={styles.error}>Error: {error}</p>}
                    {success && <p className={styles.success}>Email sent successfully!</p>}
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.sendButton}
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Email"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SendAdminMailModal;
