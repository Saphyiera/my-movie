import styles from './styles.module.css'

function MoviesSection(prop) {
    const title = "Trending Now"
    const props =
        [
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            },
            {
                title: "Spider-Man: Across the Spider-Verse",
                posterURl: "https://occ-0-2120-2119.1.nflxso.net/dnm/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABaK3lV1uRAtg5OnYt7Uf70fYj1fsW8M-zcWhuACyGqg7-fG3m5NH1TDXPdPPfdBQn0H8YGBjnC6kgioCvcHc2afIDKD6Elor-6qY.jpg?r=1df",
            }
        ];
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{title}</h1>
            <select className={styles.typeSelector}>
                <option value='movies'>Movies</option>
                <option value='shows'>TV shows</option>
            </select>
            <div className={styles.rowContainer}>
                {props.map(
                    (movie, index) => {
                        return <div key={index} className={styles.itemContainer} onClick={console.log("skibidi")}>
                            <img src={movie.posterURl} alt="Can't load image!" className={styles.poster}></img>
                            <div className={styles.movie}>{movie.title}</div>
                        </div>
                    }
                )}
            </div>
        </ div>
    );
}

export default MoviesSection