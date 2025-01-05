import React from 'react';
import styles from './styles.module.css';

const AboutUs = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>About Us</h1>
            <p className={styles.text}>
                Welcome to our project! We are your go-to destination for discovering, exploring, and enjoying movies.
                Our platform is dedicated to providing you with personalized recommendations, in-depth reviews, and
                insights into your favorite films and genres.
            </p>
            <p className={styles.text}>
                Our mission is to enhance your movie-watching experience through AI-powered features and community-driven insights.
            </p>
        </div>
    );
};

export default AboutUs;
