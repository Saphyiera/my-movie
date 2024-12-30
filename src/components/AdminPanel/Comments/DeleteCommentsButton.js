import React, { useState } from 'react';
import styles from './styles.module.css';

const DeleteCommentsButton = ({ commentids, title }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');

    const handleDeleteComments = async () => {
        if (!Array.isArray(commentids) || commentids.length === 0) {
            setMessage('No comment IDs to delete.');
            return;
        }

        setIsProcessing(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:2811/admin/comments', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ commentids }),
            });

            const result = await response.json();

            if (result.success) {
                setMessage(result.message);
            } else {
                setMessage(result.message || 'Failed to delete comments.');
            }
        } catch (error) {
            console.error('Error deleting comments:', error);
            setMessage('An unexpected error occurred.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={styles.deleteCommentsContainer}>
            <button
                onClick={handleDeleteComments}
                disabled={isProcessing}
                className={styles.deleteCommentsButton}
            >
                {isProcessing ? 'Deleting...' : title}
            </button>
            {message && <div className={styles.message}>{message}</div>}
        </div>
    );
};

export default DeleteCommentsButton;
