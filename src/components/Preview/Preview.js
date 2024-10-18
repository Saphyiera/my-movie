import styles from './styles.module.css'

function Preview(prop) {
    const props = {
        id: 81594921,
        title: "Spider-Man: Across the Spider-Verse",
        type: "Movie",
        synopsis: "Family blues. A villain bent on revenge. A Multiverse full of Spider-People. But the real challenge for Miles Morales? Figuring out who he wants to be.",
        release_year: 2023,
        poster_url: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
        video_url: "",
        rating: 9,
        count: 2811,
        actors: [
            "Shameik Moore",
            "Hailee Steinfeld",
            "Brian Tyree Henry",
            "Luna Lauren Velez",
            "Jake Johnson",
            "Oscar Isaac",
            "Jason Schwartzman",
            "Issa Rae",
            "Daniel Kaluuya",
            "Karan Soni",
            "Shea Whigham",
            "Greta Lee",
            "Mahershala Ali"
        ],
        genres: [
            "Family",
            "Kids & Family",
            "Sci-Fi",
            "Action & Adventure"
        ]
    };
    const stars = [];
    for (let i = 0; i < 10; i++) {
        if (i < props.rating) {
            stars[i] = true;
        }
        else stars[i] = false;
    }
    console.log(stars);

    return (
        <>
            <div className={styles.imageContainer}>
                <div>
                    <img src={props.poster_url} alt="Can't load image!" className={styles.preViewImage}></img>
                </div>
                <h2 className={styles.title}>{props.title}</h2>
            </div>
            <div className={styles.contentContainer}>
                <p className={styles.synopsis}>{props.synopsis}</p>
                <button type='submit' className={styles.watchButton}>Watch Now &gt;</button>
                <p className={styles.releaseYear}>Release year: {props.release_year}</p>
                <p className={styles.rating}>Rating:
                    {
                        stars.map((star) => {
                            if (star === true) {
                                return <span className="fa fa-star" style={myStyles.starChecked}></span>;
                            }
                            else {
                                return <span className="fa fa-star" style={myStyles.starUnchecked}></span>;
                            }
                        })
                    }
                    <span style={myStyles.starUnchecked}></span>
                    &#40;{props.rating}/10&#41; by {props.count} viewers.</p>
                <div className={styles.actorsContainer}>Actors: {props.actors.map((actor) => { return <p className={styles.actor}>{actor}</p> })}</div>
                <div className={styles.genresContainer}>Genres: {props.genres.map((genre) => { return <p className={styles.genre}>{genre}</p> })}</div>
            </div >
        </>
    );
}

const myStyles = {
    starChecked: {
        color: 'gold',
        padding: 3
    },
    starUnchecked: {
        padding: 3
    }
}

export default Preview