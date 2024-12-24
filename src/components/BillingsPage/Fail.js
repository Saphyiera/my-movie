import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Fail.module.css';
import Padding from '../Utils/Padding/Padding';

const Fail = () => {
    const navigate = useNavigate();

    const handleRetry = () => {
        navigate('/billings');
    };

    return (
        <>
            <div className={styles.failContainer}>
                <h2 className={styles.failMessage}>Payment Failed</h2>
                <p className={styles.description}>
                    Unfortunately, your payment could not be processed. Please try again or contact support if the issue persists.
                </p>
                <button className={styles.retryButton} onClick={handleRetry}>
                    Retry Payment
                </button>
            </div>
            <Padding paddingY="30vh" style={{ backgroundColor: 'transparent' }} />
        </>
    );
};

export default Fail;
