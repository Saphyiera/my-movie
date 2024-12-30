import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import HideCommentsButton from "./HideCommentsButton";
import DismissReportedCommentsButton from "./DismissReportedCommentsButton";
import DeleteCommentsButton from "./DeleteCommentsButton";

const ReportedComments = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch("http://localhost:2811/admin/comments/reported");
                const result = await response.json();
                if (result.success) {
                    setComments(result.data);
                } else {
                    throw new Error(result.message || "Failed to fetch comments");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, []);

    if (loading) return <div className={styles.loading}>Loading reported comments...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;

    return (
        <div className={styles.container}>
            <HideCommentsButton comments={comments} title="Hide All" />
            <h1 className={styles.title}>Reported Comments</h1>
            <div className={styles.commentsList}>
                {comments.map((comment) => (
                    <div
                        key={comment.commentid}
                        className={`${styles.comment} ${comment.hidden ? styles.hidden : ""}`}
                    >
                        <div className={styles.userInfo}>
                            <img
                                src={comment.profile_picture}
                                alt={`${comment.username}'s profile`}
                                className={styles.profilePicture}
                            />
                            <span className={styles.username}>{comment.username}</span>
                        </div>
                        <div className={styles.commentText}>{comment.comment}</div>
                        <div className={styles.movieId}>Movie ID: {comment.movieid}</div>
                        <div className={styles.postDate}>
                            Posted on: {new Date(comment.postdate).toLocaleString()}
                        </div>
                        <div className={styles.status}>
                            Status: {comment.hidden ? "Hidden" : "Visible"}
                        </div>
                        {comment.reasons.length > 0 && (
                            <div className={styles.hiddenReasons}>
                                <strong>Reasons:</strong>
                                <ul>
                                    {comment.reasons.map((reason, index) => (
                                        <li key={index}>{reason}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <HideCommentsButton comments={[comment]} title="Hide" />
                        <DismissReportedCommentsButton commentids={[comment.commentid]} title="Dismiss" />
                        <DeleteCommentsButton commentids={[comment.commentid]} title="Delete" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportedComments;
