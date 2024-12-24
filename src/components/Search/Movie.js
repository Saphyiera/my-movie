import styles from './styles.module.css';

const Movie = (props) => {
    const { id, title, synopsis, release_year, poster_url, rating, count } = props;

    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <img src={poster_url} alt="Can't load image" className={styles.image} />
            </div>
            <div className={styles.textContainer}>
                <div className={styles.titleIdContainer}>
                    <p className={styles.title}>{title}</p>
                    <p className={styles.id}>ID: {id}</p>
                </div>
                <div className={styles.synopsisContainer}>
                    <p className={styles.synopsis}>{synopsis}</p>
                </div>
                <p className={styles.releaseYear}>Release year: {release_year}</p>
                <p className={styles.rating}>Rating: {rating / count}/10 by {count} viewers</p>
            </div>
        </div>
    );
}

export default Movie;
