import React from 'react';
import styles from './styles.module.css';

const TermsAndConditions = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Terms and Conditions</h1>
            <p className={styles.text}>
                By using our website, you agree to comply with our terms and conditions. Please read them carefully:
            </p>
            <ul className={styles.list}>
                <li className={styles.listItem}>Content is for personal use only and cannot be redistributed without permission.</li>
                <li className={styles.listItem}>All reviews and comments must adhere to our community guidelines.</li>
                <li className={styles.listItem}>We reserve the right to modify or terminate services at any time.</li>
            </ul>
        </div>
    );
};

export default TermsAndConditions;
