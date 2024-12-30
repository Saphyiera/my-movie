import React, { useState, useEffect } from 'react';
import styles from './WatchedMovies.module.css';
import { useNavigate } from 'react-router-dom';

const WatchedMovies = () => {
    const userId = localStorage.getItem('id');
    const [movies, setMovies] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const navigate = useNavigate();
    const moviesPerPage = 6;

    useEffect(() => {
        const fetchWatchedMovies = async () => {
            if (!userId) return;

            try {
                const response = await fetch(
                    `http://localhost:2811/movie/watched?userId=${userId}&page=${currentPage}&limit=${moviesPerPage}`
                );
                const data = await response.json();
                setMovies(data.data);
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error('Error fetching watched movies:', error);
            }
        };

        fetchWatchedMovies();
    }, [userId, currentPage, moviesPerPage]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (!userId) {
        return <p className={styles.message}>You must be logged in to view your watched movies.</p>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Watched</h2>
            <div className={styles.grid}>
                {movies.map((movie) => (
                    <div key={movie.id} className={styles.movieCard} onClick={() => navigate('/watch/' + movie.id)}>
                        <img
                            src={movie.poster_url}
                            alt={movie.title}
                            className={styles.poster}
                        />
                        <h3 className={styles.title}>{movie.title}</h3>
                    </div>
                ))}
            </div>
            <div className={styles.pagination}>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles.button}
                >
                    Previous
                </button>
                <span className={styles.pageInfo}>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={styles.button}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default WatchedMovies;
