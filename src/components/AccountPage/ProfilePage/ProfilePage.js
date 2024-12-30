import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import ProfileUpdate from "./ProfileUpdate";
import { useNavigate } from "react-router-dom";
import WatchedMovies from "../WatchedMovies/WatchedMovies";

const ProfilePage = () => {
    const userId = localStorage.getItem('id');
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [showUpdate, setShowUpdate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:2811/user?id=${userId}`);

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

    const toggleUpdateButton = () => {
        setShowUpdate(!showUpdate);
    }

    const logout = () => {
        localStorage.removeItem('id');
        localStorage.removeItem('token');
        navigate('../login');
    }

    useEffect(() => {

        fetchUserData();
    }, [userId]);

    const handleVerifyEmail = async () => {
        const confirmation = window.confirm('Are you sure you want to verify this email?');

        if (!confirmation) {
            return;
        }
        try {
            const response = await fetch('http://localhost:2811/user/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    id: user.id,
                }),
            });

            if (!response.ok) {
                alert('Email verification failed');
            }
            else {
                alert('An email sent to your registered mail, confirm that to verify your email, check spam if needed!')
            }

            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error verifying email:', error);
        }
    };

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

    if (!user || !userId)
        return (
            <div className={styles.profileContainer}>
                <div className={styles.noData}>
                    <p>🔍 No user data available. Login or Register first!</p>
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
                    {
                        !user.email_is_verified &&
                        <button onClick={handleVerifyEmail} className={styles.emailVerifyButton}>Verify Email</button>
                    }
                </div>
                <p className={styles.text}><strong>Info:</strong> {user.info || "No additional information"}</p>
                <p className={styles.text}><strong>Joined on:</strong> {new Date(user.created_at).toLocaleString()}</p>
            </div>
            <button onClick={logout} style={{
                padding: "10px 20px",
                backgroundColor: "coral",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
                marginRight: '10px',
                transition: "background-color 0.3s ease",
            }}>Log Out</button>

            <button
                name="update"
                onClick={toggleUpdateButton}
                style={{
                    padding: "10px 20px",
                    backgroundColor: "cornflowerblue",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                    transition: "background-color 0.3s ease",
                }}
            >
                Update Profile
            </button>
            {
                showUpdate &&
                <ProfileUpdate userId={user.id} refresh={fetchUserData} />
            }
            {
                userId &&
                <WatchedMovies />
            }
        </div>
    );
};

export default ProfilePage;
