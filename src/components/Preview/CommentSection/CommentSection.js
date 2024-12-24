import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import Comment from './Comment';
import PostComment from './PostComment';

const CommentSection = ({ id, title }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const commentsPerPage = 10;

    const fetchComments = async (page) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `http://localhost:2811/movie/comments?id=${id}&page=${page}&limit=${commentsPerPage}`
            );
            if (response.ok) {
                const data = await response.json();
                setComments(data.data);
                setTotalPages(data.pagination.totalPages);
            } else {
                setError("Failed to fetch comments");
            }
        } catch (err) {
            setError("An error occurred while fetching comments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments(currentPage);
    }, [id, currentPage]);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    if (loading) return <div className={styles.loading}>Loading comments...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>
            <PostComment movieId={id} />
            {comments.length > 0 ? (
                <ul>
                    {comments.map((comment) => (
                        <Comment
                            key={comment.commentid}
                            comment={comment}
                            onDelete={(deletedCommentId) => {
                                setComments((prevComments) =>
                                    prevComments.filter((c) => c.commentid !== deletedCommentId)
                                );
                            }}
                        />))}
                </ul>
            ) : (
                <p className={styles.noComments}>No comments found!</p>
            )}

            {
                comments.length > 0 &&
                <div className={styles.pagination}>
                    <button
                        className={styles.paginationButton}
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className={styles.paginationButton}
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            }
        </div>
    );
};

export default CommentSection;
