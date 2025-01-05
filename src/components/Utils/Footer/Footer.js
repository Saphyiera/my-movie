import React from "react";
import { FaFacebook, FaInstagram, FaGithub } from "react-icons/fa";  // Import icons
import styles from "./styles.module.css";

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerLinks}>
                    <ul>
                        <li><a href="/footer/about">About Us</a></li>
                        <li><a href="/footer/contact">Contact</a></li>
                        <li><a href="/footer/terms">Terms & Conditions</a></li>
                        <li><a href="/footer/policy">Privacy Policy</a></li>
                        <li><a href="/footer/faq">Questions</a></li>
                    </ul>
                </div>
                <div className={styles.socialMedia}>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                        <FaFacebook size={24} />
                    </a>
                    <a href="https://www.instagram.com/doitsch_" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                        <FaInstagram size={24} />
                    </a>
                    <a href="https://github.com/Saphyiera" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                        <FaGithub size={24} />
                    </a>
                </div>
            </div>
            <div className={styles.footerBottom}>
                <p>&copy; Project Movie Website. All Rights Reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
