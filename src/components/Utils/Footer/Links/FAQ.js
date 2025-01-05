import React from 'react';
import styles from './styles.module.css';

const FAQ = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Frequently Asked Questions</h1>
            <div className={styles.question}>
                <h3 className={styles.subheading}>How do I create an account?</h3>
                <p className={styles.text}>Click on the "Sign Up" button at the top right and fill out the registration form.</p>
            </div>
            <div className={styles.question}>
                <h3 className={styles.subheading}>How do I cancel my membership?</h3>
                <p className={styles.text}>Navigate to your Billing page and click the "Cancel Membership" button.</p>
            </div>
            <div className={styles.question}>
                <h3 className={styles.subheading}>Can I rate and review movies?</h3>
                <p className={styles.text}>Yes! Sign in to your account and visit any movie's page to leave your review.</p>
            </div>
        </div>
    );
};

export default FAQ;
