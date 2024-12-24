import React, { useState } from 'react';
import styles from './styles.module.css';

const PostComment = ({ movieId }) => {
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');
    const userId = localStorage.getItem('id');

    const handlePostComment = async () => {
        if (!userId) {
            setMessage('You need to sign in to post a comment.');
            return;
        }

        if (!comment.trim()) {
            setMessage('Comment cannot be empty.');
            return;
        }

        try {
            const response = await fetch('http://localhost:2811/movie/comment/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, movieId, comment }),
            });

            const data = await response.json();
            if (data.status === 200) {
                setMessage('Comment posted successfully!');
                setComment('');
            } else {
                setMessage('Failed to post comment. Please try again later.');
            }
        } catch (err) {
            console.error('Error posting comment:', err);
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className={styles.postCommentContainer}>
            {!userId ? (
                <p className={styles.warning}>You need to sign in to post a comment.</p>
            ) : (
                <>
                    <textarea
                        className={styles.textarea}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your comment here..."
                    />
                    <button className={styles.postButton} onClick={handlePostComment}>
                        Post Comment
                    </button>
                </>
            )}
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
};

export default PostComment;
