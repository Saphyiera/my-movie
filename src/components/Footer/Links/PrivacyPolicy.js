import React from 'react';
import styles from './styles.module.css';

const PrivacyPolicy = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Privacy Policy</h1>
            <p className={styles.text}>
                Here, we value your privacy. Here’s how we collect, use, and protect your data:
            </p>
            <ul className={styles.list}>
                <li className={styles.listItem}>We collect minimal personal data necessary for account creation and personalized recommendations.</li>
                <li className={styles.listItem}>Your data is never shared with third parties without your consent.</li>
                <li className={styles.listItem}>All sensitive information is encrypted and stored securely.</li>
            </ul>
        </div>
    );
};

export default PrivacyPolicy;
