import React, { useState, useEffect } from "react";
import styles from './styles.module.css';
import { useNavigate } from "react-router-dom";

function MoviesSection({ title, count }) {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [movieType, setMovieType] = useState('all');
    const [max, setMax] = useState(count.count);
    const [inputPage, setInputPage] = useState(""); // State for input field
    const [errorMessage, setErrorMessage] = useState(""); // State for error message

    const fetchMovies = async () => {
        setLoading(true);
        let url = 'http://localhost:2811/suggestions/';
        if (title === "All Movies") {
            url += 'all';
        } else if (title === "Top Rated Movies") {
            url += 'rating';
        } else if (title === "Recent Movies") {
            url += 'recent';
        }

        try {
            const response = await fetch(`${url}?page=${currentPage}&pageSize=6&type=${movieType}`);
            const data = await response.json();

            if (data.status === 200) {
                setMovies(data.data);
            } else {
                console.error('Failed to fetch data:', data.message);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    const onNextPage = () => {
        if (currentPage * 6 < max) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const onMoveFirst = () => {
        setCurrentPage(1);
    }

    const onMoveLast = () => {
        setCurrentPage(Math.ceil(max / 6));
    }

    const handleGoToPage = () => {
        const pageNumber = parseInt(inputPage, 10);

        if (!pageNumber || pageNumber < 1 || pageNumber > Math.ceil(max / 6)) {
            setErrorMessage(`Please enter a valid page between 1 and ${Math.ceil(max / 6)}.`);
        } else {
            setCurrentPage(pageNumber);
            setErrorMessage(""); // Clear error message
        }
        setInputPage(""); // Reset input field
    };

    const handleError = () => {
        setErrorMessage("");
    }

    useEffect(() => {
        fetchMovies();
    }, [title, currentPage, movieType]);

    const handleTypeChange = (event) => {
        const type = event.target.value
        setMovieType(type);
        if (type === 'all') {
            setMax(count.count);
        } else if (type === 'show') {
            setMax(count.count_show);
        } else {
            setMax(count.count_movie);
        }
        setCurrentPage(1);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{title}</h1>
                <div className={styles.typeSelector}>
                    <select value={movieType} onChange={handleTypeChange} className={styles.selectBox}>
                        <option value="all">All</option>
                        <option value="show">Show</option>
                        <option value="movie">Movie</option>
                    </select>
                </div>
            </div>

            <div className={styles.pagination}>
                <button
                    onClick={onMoveFirst}
                    className={styles.paginationButton}
                    disabled={currentPage === 1}
                >
                    &lt;&lt;
                </button>
                <button
                    onClick={onPrevPage}
                    className={styles.paginationButton}
                    disabled={currentPage === 1}
                >
                    &lt;
                </button>
                <p className={styles.currentPage}>
                    Page {currentPage} / {Math.ceil(max / 6)}
                </p>
                <button
                    onClick={onNextPage}
                    className={styles.paginationButton}
                    disabled={currentPage >= Math.ceil(max / 6)}
                >
                    &gt;
                </button>
                <button
                    onClick={onMoveLast}
                    className={styles.paginationButton}
                    disabled={currentPage >= Math.ceil(max / 6)}
                >
                    &gt;&gt;
                </button>
                <div className={styles.goToPage}>
                    <input
                        type="number"
                        value={inputPage}
                        min="1"
                        max={max}
                        onChange={(e) => setInputPage(e.target.value)}
                        className={styles.pageInput}
                        placeholder="Page"
                    />
                    <button
                        onClick={handleGoToPage}
                        className={styles.goToPageButton}
                    >
                        Go
                    </button>
                </div>

                {errorMessage && (
                    <>
                        <div className={styles.errorMessage}>
                            {errorMessage}
                        </div>
                        <button onClick={handleError} className={styles.goToPageButton}>OK</button>
                    </>
                )}
            </div>


            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <div className={styles.rowContainer}>
                    {movies.map((movie, index) => {
                        return (
                            <div
                                key={index}
                                className={styles.itemContainer}
                                onClick={() => navigate(`/preview/${movie.id}`)}
                            >
                                <img
                                    src={movie.poster_url}
                                    alt="Can't load image!"
                                    className={styles.poster}
                                />
                                <div className={styles.movie}>{movie.title}</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MoviesSection;
