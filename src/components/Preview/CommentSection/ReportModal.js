import React, { useState } from 'react';
import styles from './styles.module.css';
import reasons from './reasons.json';
import TextModal from '../../Utils/Notification/TextModal';

const ReportModal = ({ commentId, onClose }) => {
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [otherReason, setOtherReason] = useState('');
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const reportComment = async () => {
        const reporterId = localStorage.getItem('id') || -1;
        const reportReasons = [...selectedReasons];
        if (isOtherSelected && otherReason) {
            reportReasons.push(otherReason);
        }

        const response = await fetch('http://localhost:2811/movie/comment/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                commentId: commentId,
                reasons: reportReasons.filter(i => i !== "Other"),
                reporterId: reporterId
            })
        });

        const result = await response.json();
        if (response.ok) {
            setIsSuccess(true);
            setResultMessage(result.message || 'Report submitted successfully.');
        } else {
            setIsSuccess(false);
            setResultMessage(result.message || 'Failed to submit report.');
        }

        setShowResult(true);
    };

    const handleReasonChange = (e) => {
        const { value, checked } = e.target;
        setSelectedReasons(prevReasons =>
            checked ? [...prevReasons, value] : prevReasons.filter(reason => reason !== value)
        );
        if (value === 'Other') {
            setIsOtherSelected(checked);
        }
    };

    const handleOtherReasonChange = (e) => {
        setOtherReason(e.target.value);
    };

    return (
        <div>
            <div className={styles.modalOverlay}>
                <div className={styles.modalContainer}>
                    <h3>Report Comment</h3>

                    {reasons.reportReasons.map((reason) => (
                        <div key={reason.id} className={styles.checkboxContainer}>
                            <input
                                type="checkbox"
                                id={reason.id}
                                value={reason.reason}
                                onChange={handleReasonChange}
                                className={styles.reasonCheckbox}
                            />
                            <label htmlFor={reason.id} className={styles.checkboxLabel}>
                                {reason.reason}
                            </label>
                        </div>
                    ))}

                    {isOtherSelected && (
                        <div>
                            <textarea
                                value={otherReason}
                                onChange={handleOtherReasonChange}
                                placeholder="Please describe the reason..."
                                className={styles.otherReasonInput}
                            />
                        </div>
                    )}

                    <div className={styles.modalActions}>
                        <button className={styles.submitReportButton} onClick={reportComment}>Submit Report</button>
                        <button className={styles.closeButton} onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>

            {showResult && (
                <TextModal
                    text={resultMessage}
                    backgroundColor={isSuccess ? 'lightgreen' : 'coral'}
                    onClose={() => {
                        setShowResult(false);
                        onClose();
                    }
                    }
                />
            )}
        </div>
    );
};

export default ReportModal;
