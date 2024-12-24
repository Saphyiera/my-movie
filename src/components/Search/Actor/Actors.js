import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css'
import Alphabet from '../Alphabet/Aplhabet';

const Actors = () => {
    const [actors, setActors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedActors, setSelectedActors] = useState([]);
    const [filteredActors, setFilteredActors] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchActors = async () => {
            try {
                const response = await fetch('http://localhost:2811/actors/all');
                const result = await response.json();
                if (result.status === 200) {
                    setActors(result.data);
                } else {
                    setError('Failed to fetch actors');
                }
            } catch (err) {
                setError('An error occurred while fetching actors');
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchActors();
    }, []);

    const handleCheckboxChange = (actor) => {
        setSelectedActors((prevSelected) => {
            const isSelected = prevSelected.some((item) => item.id === actor.id);
            if (isSelected) {
                return prevSelected.filter((item) => item.id !== actor.id);
            } else {
                return [...prevSelected, actor];
            }
        });
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSubmit = () => {
        const actorIds = selectedActors.map(actor => actor.id);
        console.log(actorIds);
        navigate('../result', { state: { actorIds } });
    };

    const handleClearSelection = () => {
        setSelectedActors([]);
    };

    const onLetterClick = (letter) => {
        let newFilteredActors;
        if (letter !== "All") {
            newFilteredActors = actors.filter((actor) =>
                actor.name.toUpperCase().startsWith(letter)
            );
        } else {
            newFilteredActors = actors;
        }
        setFilteredActors(newFilteredActors);
    };

    const filteredActorsList = filteredActors ? filteredActors.filter((actor) =>
        actor.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name)) : actors.filter((actor) =>
        actor.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name))

    if (loading) return <div className={styles.loader}>Loading actors...</div>;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Actors</h2>
            <Alphabet action={onLetterClick} />
            <input
                type="text"
                placeholder="Search actors..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchBar}
            />
            <div className={styles.selected}>
                <strong>Selected Actors:</strong> {selectedActors.map((item) => item.name).join(', ') || 'None'}
            </div>
            <div className={styles.buttonContainer}>
                <button onClick={handleSubmit} className={styles.logButton}>Search movies with selected actors</button>
                <button onClick={handleClearSelection} className={styles.clearButton}>Remove all selected actors</button>
            </div>
            <ul className={styles.actorList}>
                {filteredActorsList.map((actor) => (
                    <li
                        key={actor.id}
                        className={styles.actorCard}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d0e7ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={selectedActors.some((item) => item.id === actor.id)}
                                onChange={() => handleCheckboxChange(actor)}
                                className={styles.checkbox}
                            />
                            <span className={styles.actorName}>{actor.name}</span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Actors;