import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Success.module.css';
import Padding from '../Utils/Padding/Padding';

const Success = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handlePaymentConfirmation = async () => {
            const userId = localStorage.getItem('id');
            if (!userId) {
                navigate('/billings/fail');
                return;
            }

            try {
                const response = await fetch(`http://localhost:2811/pay/current-plan`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                });

                if (!response.ok) {
                    console.error('Payment confirmation failed:', response.statusText);
                    navigate('/billings/fail');
                }
            } catch (error) {
                console.error('Error during payment confirmation:', error);
                navigate('/billings/fail');
            }
        };

        handlePaymentConfirmation();
    }, [navigate]);

    const handleNavigation = () => {
        navigate('/billings');
    };

    return (
        <>
            <div className={styles.successContainer}>
                <h2 className={styles.successMessage}>Payment Successful!</h2>
                <p className={styles.description}>
                    Thank you for your payment. Your transaction was completed successfully.
                    <br /><br />Now you have access to our AI-powered features for your movie-watching experience!
                </p>
                <button className={styles.navigateButton} onClick={handleNavigation}>
                    Go back
                </button>
            </div>
            <Padding paddingY="20vh" style={{ backgroundColor: 'transparent' }} />
        </>
    );
};

export default Success;
