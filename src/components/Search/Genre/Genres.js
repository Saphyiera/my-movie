import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import Alphabet from '../Alphabet/Aplhabet';

const Genres = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [filteredGenres, setFilteredGenres] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch('http://localhost:2811/genres/all');
                const result = await response.json();
                if (result.status === 200) {
                    setGenres(result.data);
                } else {
                    setError('Failed to fetch genres');
                }
            } catch (err) {
                setError('An error occurred while fetching genres');
                console.error("Err: ", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGenres();
    }, []);

    const handleCheckboxChange = (genre) => {
        setSelectedGenres((prevSelected) => {
            const isSelected = prevSelected.some((item) => item.id === genre.id);
            if (isSelected) {
                return prevSelected.filter((item) => item.id !== genre.id);
            } else {
                return [...prevSelected, genre];
            }
        });
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSubmit = async () => {
        const genreIds = selectedGenres.map((genre) => genre.id);
        console.log(genreIds);

        const response = await fetch(`http://localhost:2811/get/movies/genre`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                genreIds: genreIds
            })
        });
        const data = await response.json();
        if (data.status === 200) {
            console.log(data.data);
        } else {
            console.log(data.message);
        }
        navigate('../result', { state: { genreIds } });
    };

    const handleRemove = () => {
        setSelectedGenres([]);
    };

    const comparison = (a, b) => a.name.localeCompare(b.name);

    const onLetterClick = (letter) => {
        let newFilteredGenres;
        if (letter !== "All") {
            newFilteredGenres = genres.filter((genre) =>
                genre.name.toUpperCase().startsWith(letter)
            );
        } else {
            newFilteredGenres = genres;
        }
        setFilteredGenres(newFilteredGenres);
    };

    let filteredGenresList = filteredGenres ? filteredGenres.filter((genre) =>
        genre.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort(comparison) : genres.filter((genre) =>
        genre.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort(comparison);


    if (loading) return <div className={styles.loader}>Loading genres...</div>;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Genres</h2>
            <Alphabet action={onLetterClick} />
            <input
                type="text"
                placeholder="Search genres..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchBar}
            />
            <button
                onClick={handleSubmit}
                className={styles.submitButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0000ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
            >
                Search movies with selected genres
            </button>
            <button
                onClick={handleRemove}
                className={styles.removeButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff0000'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
            >
                Remove all selected genres
            </button>
            <div className={styles.selected}>
                <strong>Selected Genres:</strong> {selectedGenres.map((item) => item.name).join(', ') || 'None'}
            </div>
            <ul className={styles.genreList}>
                {filteredGenresList.map((genre) => (
                    <li
                        key={genre.id}
                        className={styles.genreCard}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d0e7ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={selectedGenres.some((item) => item.id === genre.id)}
                                onChange={() => handleCheckboxChange(genre)}
                                className={styles.checkbox}
                            />
                            <span className={styles.genreName}>{genre.name}</span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Genres;
