import React from 'react';
import styles from './styles.module.css';

const ContactUs = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Contact Us</h1>
            <p className={styles.text}>
                If you have any questions, feedback, or concerns, feel free to reach out to us:
            </p>
            <ul className={styles.list}>
                <li className={styles.listItem}>Email: skibidi@toilet.rizz</li>
                <li className={styles.listItem}>Phone: +1-800-MOVIE</li>
                <li className={styles.listItem}>Address: 123 Movie Street, Film City, CA</li>
            </ul>
            <form className={styles.form}>
                <label className={styles.label}>
                    Your Message:
                    <textarea className={styles.textarea} rows="4" placeholder="Write your message here..." />
                </label>
                <button type="submit" className={styles.button}>Submit</button>
            </form>
        </div>
    );
};

export default ContactUs;
