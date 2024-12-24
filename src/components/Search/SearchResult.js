import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import Movie from "./Movie";

const SearchResult = () => {
    const location = useLocation();
    const { genreIds, actorIds, title } = location.state || {};
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            let url = '';
            let body = {};

            if (genreIds && genreIds.length > 0) {
                url = `http://localhost:2811/get/movies/genre`;
                body = { genreIds };
            } else if (actorIds && actorIds.length > 0) {
                url = `http://localhost:2811/get/movies/actor`;
                body = { actorIds };
            } else if (title) {
                url = `http://localhost:2811/get/movie/title`;
                body = { title };
            }
            else {
                console.error("No genre or actor IDs or title name provided");
                return;
            }

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const result = await response.json();

            if (result.status === 200) {
                setData(result.data);
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [genreIds, actorIds]);


    const handleMovieClick = (id) => {
        navigate(`/preview/${id}`);
    };

    return (
        <div style={data.length === 0 ? {
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        } : { minHeight: "100vh" }}>
            {data.length > 0 ? (<>
                <h1 style={{ textAlign: 'center' }}>Here're the movies you might want!</h1>
                {data.map((item) => (
                    <div key={item.id} onClick={() => handleMovieClick(item.id)}>
                        <Movie key={item.id + item.id.toString()} {...item} />
                    </div>
                ))}
            </>
            ) : (
                <h1 style={{ textAlign: 'center' }}>No movies founded! Maybe you haven't selected any criteria.</h1>
            )}
        </div>
    );
};

export default SearchResult;