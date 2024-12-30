import React, { useState } from 'react';
import styles from './styles.module.css';
import ReportModal from './ReportModal';
import { useNavigate } from 'react-router-dom';

const Comment = ({ comment, onDelete }) => {
    const userId = localStorage.getItem('id');
    const navigate = useNavigate();

    const { username, comment: commentText, postdate, reasons: commentReasons, profile_picture, hidden, commentid, userid } = comment;
    const [show, setShow] = useState(!hidden);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openReportModal = () => {
        setIsModalOpen(true);
    };

    const closeReportModal = () => {
        setIsModalOpen(false);
    };

    const deleteComment = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
        if (!confirmDelete) return;

        try {
            const response = await fetch('http://localhost:2811/movie/comment', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ commentid }),
            });

            if (response.ok) {
                alert("Comment deleted successfully.");
                if (onDelete) {
                    onDelete(commentid);
                }
            } else {
                const error = await response.json();
                alert(`Failed to delete comment: ${error.message}`);
            }
        } catch (err) {
            alert("An error occurred while trying to delete the comment.");
            console.error(err);
        }
    };

    return (
        <div className={styles.itemContainer}>
            <div className={styles.userContainer}>
                <div className={styles.userAndPfp} onClick={() => navigate('/user/guest/' + userid)}>

                    <img
                        src={profile_picture || "https://www.nomadfoods.com/wp-content/uploads/2018/08/placeholder-1-e1533569576673.png"}
                        alt={`${username}'s profile`}
                        className={styles.pfpContainer}
                    />
                    <p className={styles.username}>{username}</p>
                </div>
                <div className={styles.buttonContainer}>
                    {userId == userid && (
                        <button className={styles.deleteButton} onClick={deleteComment}>
                            Delete
                        </button>
                    )}
                    <button className={styles.reportButton} onClick={openReportModal}>
                        Report
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <ReportModal commentId={commentid} onClose={closeReportModal} />
            )}

            {show &&
                <p className={styles.text}>{commentText}</p>
            }

            <p className={styles.postDate}><strong>Posted on:</strong> {new Date(postdate).toLocaleString()}</p>
            {commentReasons && commentReasons.length > 0 && !show && (
                <>
                    <p className={styles.reasons}><strong>Comment is hidden due to:</strong> {commentReasons.join(', ')} <br /> Do you want to see?</p>
                    <button className={styles.showButton} onClick={() => setShow(true)}>Show comment</button>
                </>
            )}

        </div>
    );
};

export default Comment;