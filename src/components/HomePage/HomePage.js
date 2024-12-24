import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar/SearchBar";
import styles from './styles.module.css';
import MoviesSection from "./MoviesSection/MoviesSection";
import Padding from "../Utils/Padding/Padding"

function HomePage() {
    const [count, setCount] = useState({
        "count": 336,
        "count_movie": 205,
        "count_show": 131
    });

    const fetchCount = async () => {
        const local = JSON.parse(localStorage.getItem('count'))
        if (local) {
            console.log(local);
            setCount(local);
        } else {
            try {
                const response = await fetch('http://localhost:2811/movie/count');
                const result = await response.json();
                if (response.ok) {
                    setCount(result + "res");
                    localStorage.setItem('count', JSON.stringify(result));
                    console.log(result)
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
    useEffect(() => {
        fetchCount();
    }, [])

    return (
        <>
            <div style={{ backgroundColor: 'white', margin: '20px', borderRadius: '20px' }}>

                <h1 className={styles.welcome}>Skibidi movie</h1>
            </div>
            <SearchBar />
            <img
                src="https://th.bing.com/th/id/R.6de7ad3a0cdc3f1c04707087c3a301dc?rik=b7OgZec2UAxMbQ&riu=http%3a%2f%2fhdqwalls.com%2fwallpapers%2fspiderman-into-the-spider-verse-art-7y.jpg&ehk=D3efqZ0H3G%2bZXa2lL0TKBQ3k06VvH6B689kjbxbEyCQ%3d&risl=&pid=ImgRaw&r=0"
                alt="Spider-Man Background"
                className={styles.backgroundImage}
            />
            <MoviesSection title="Recent Movies" count={count} />
            <MoviesSection title="Top Rated Movies" count={count} />
            <MoviesSection title="All Movies" count={count} />
            <Padding paddingTop="100px" />
        </>
    );
}

export default HomePage;
