import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';
import DeleteCommentsButton from './DeleteCommentsButton';

const AllComments = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch('http://localhost:2811/admin/comments');
                if (!response.ok) {
                    throw new Error('Failed to fetch comments');
                }
                const data = await response.json();
                setComments(data.data || []);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchComments();
    }, []);

    if (loading) {
        return <p className={styles.loading}>Loading comments...</p>;
    }

    if (error) {
        return <p className={styles.error}>Error: {error}</p>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>All Comments</h1>
            <div className={styles.commentsList}>
                {comments.map((comment) => (
                    <div
                        key={comment.commentid}
                        className={`${styles.comment} ${comment.hidden ? styles.hidden : ''}`}
                    >
                        <div className={styles.userInfo}>
                            <img
                                src={comment.profile_picture}
                                alt={`${comment.username}'s profile`}
                                className={styles.profilePicture}
                            />
                            <p className={styles.username}>{comment.username}</p>
                        </div>
                        <p className={styles.commentText}>{comment.comment}</p>
                        <p className={styles.movieId}>Movie ID: {comment.movieid}</p>
                        <p className={styles.postDate}>Posted on: {new Date(comment.postdate).toLocaleString()}</p>
                        {comment.hidden ? (
                            <div className={styles.hiddenReasons}>
                                <p>Hidden Reasons:</p>
                                <ul>
                                    {comment.hidden_reasons.map((reason, index) => (
                                        <li key={index}>{reason}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className={styles.status}>Status: Visible</p>
                        )}
                        <DeleteCommentsButton commentids={[comment.commentid]} title="Delete" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllComments;
