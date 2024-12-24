import React from 'react';
import styles from './styles.module.css';

const TextModal = ({ text, backgroundColor, onClose }) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer} style={{ backgroundColor }}>
                <p className={styles.modalText}>{text}</p>
                <button className={styles.closeButton} onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default TextModal;
