import styles from './styles.module.css';
const alphabet = require('../Alphabet.json').alphabet;

const Alphabet = ({ action }) => {
    return (
        <div className={styles.alphabetContainer}>
            {alphabet.map((letter, index) => (
                <span key={index} className={styles.alphabetLetter} onClick={() => action(letter)}>
                    {letter}
                </span>
            ))}
        </div>
    );
};

export default Alphabet;
