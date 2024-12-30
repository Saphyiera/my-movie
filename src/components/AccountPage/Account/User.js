import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { useParams } from "react-router-dom";

const User = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:2811/user?id=${id}`);

            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }

            const data = await response.json();
            setUser(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchUserData();
    }, [id]);

    if (loading)
        return (
            <div className={styles.profileContainer}>
                <div className={styles.loading}>
                    <span className={styles.spinner}></span>
                    <p>Loading...</p>
                </div>
            </div>
        );

    if (error)
        return (
            <div className={styles.profileContainer}>
                <div className={styles.error}>
                    <p>⚠ Error: {error}</p>
                </div>
            </div>
        );

    if (!user)
        return (
            <div className={styles.profileContainer}>
                <div className={styles.noData}>
                    <p>🔍 No user data available.</p>
                </div>
            </div>
        );

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileHeader}>
                {user.profile_picture ? (
                    <img
                        src={user.profile_picture}
                        alt="Profile Picture"
                        className={styles.profilePicture}
                    />
                ) : (
                    <div className={styles.placeholderPicture}>No PFP</div>
                )}
                <div className={styles.nameAndId}>
                    <h2 className={styles.username}>{user.username}</h2>
                    <p className={styles.id}><strong>ID:</strong> {user.id}</p>
                </div>
            </div>

            <div className={styles.profileDetails}>
                <div className={styles.emailContainer}>

                    <p className={styles.text}><strong>Email:</strong> {user.email}</p>
                    <div
                        className={
                            user.email_is_verified
                                ? styles.verifiedStatus
                                : styles.unverifiedStatus
                        }
                    >
                        {user.email_is_verified ? (
                            <span className={styles.emailStatus}>✔ Verified</span>
                        ) : (
                            <span className={styles.emailStatus}>✖ Unverified</span>
                        )}
                    </div>
                </div>
                <p className={styles.text}><strong>Info:</strong> {user.info || "No additional information"}</p>
                <p className={styles.text}><strong>Joined on:</strong> {new Date(user.created_at).toLocaleString()}</p>
            </div>
        </div>
    );
};

export default User;
