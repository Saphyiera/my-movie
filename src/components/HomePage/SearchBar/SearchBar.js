import React, { useState } from 'react';
import styles from './styles.module.css';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();

        setLoading(true);
        navigate('../result', { state: { title: searchTerm } })
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSearch} className={styles.form}>
                <input
                    type="text"
                    placeholder="Search for a movie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
                <button type="submit" className={styles.searchButton} onClick={handleSearch}>Search</button>
            </form>
            {loading && <p>Loading...</p>}
        </div>
    );
};

export default SearchBar;
