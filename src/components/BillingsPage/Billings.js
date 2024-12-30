import React, { useEffect, useState } from 'react';
import styles from './Billing.module.css';

export default function Billing() {
    const [isDiamondMember, setIsDiamondMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('id');

    const checkCurrentPlan = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`http://localhost:2811/pay/current-plan?userId=${userId}`);
            if (response.ok) {
                const result = await response.json();
                setIsDiamondMember(result.isDiamondMember);
            } else {
                console.error('Failed to check current plan');
            }
        } catch (error) {
            console.error('Error checking current plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = () => {
        if (userId) {
            window.location.href = `http://localhost:2811/pay`;
        } else {
            alert('User is not logged in.');
        }
    };

    const cancelMembership = async () => {
        if (!userId) {
            alert('User is not logged in.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:2811/pay/current-plan?userId=${userId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert('Membership canceled successfully.');
                setIsDiamondMember(false);
            } else {
                console.error('Failed to cancel membership');
            }
        } catch (error) {
            console.error('Error canceling membership:', error);
            alert('An error occurred. Please try again.');
        }
    };

    useEffect(() => {
        checkCurrentPlan();
    }, []);

    if (loading) return <div className={styles.loading} style={{ minHeight: '100vh' }}>Loading...</div>;

    if (!userId) {
        return <div className={styles.notLoggedIn} style={{ minHeight: '100vh' }}>Please log in to manage your membership.</div>;
    }

    return (
        <div className={styles.billingContainer}>
            <div className={`${styles.tier} ${styles.freeTier}`}>
                <h2>Free Tier {isDiamondMember ? null : <span>(Current Plan)</span>}</h2>
                <ul className={styles.featuresList}>
                    {[
                        'Access to all movies',
                        'Access to Recent, Top Rated movies recommendation',
                        'Search movies by title, genres, actors',
                        'Marked movies',
                        'Playlists',
                        'Rate, comment on movies',
                    ].map((feature, index) => (
                        <li key={index}>
                            <span className={styles.greenTick}>&#10003;</span>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>
            <div className={`${styles.tier} ${styles.diamondTier}`}>
                <h2>Diamond Member {isDiamondMember ? <span>(Current Plan)</span> : null}</h2>
                <ul className={styles.featuresList}>
                    {[
                        'All free tier features',
                        'Suggestions from previous watched movies',
                        'Semantic search', 'AI chatbot'
                    ].map((feature, index) => (
                        <li key={index}>
                            <span className={styles.greenTick}>&#10003;</span>
                            {feature}
                        </li>
                    ))}
                </ul>
                {isDiamondMember ? (
                    <button className={styles.cancelButton} onClick={cancelMembership}>
                        Cancel Membership
                    </button>
                ) : (
                    <button className={styles.payButton} onClick={handlePayment} disabled={isDiamondMember}>
                        11$ To Become A Diamond Member
                    </button>
                )}
            </div>
        </div>
    );
}