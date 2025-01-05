import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminPanel.module.css';

const AdminPanel = () => {
    return (
        <>
            <div className={styles.adminPanel}>
                <h1>Admin Panel</h1>
                <div className={styles.navigation}>
                    <Link to="/admin/users">
                        <button className={styles.navButton}>Manage Users</button>
                    </Link>
                    <Link to="/admin/user/reset-password">
                        <button className={styles.navButton}>Reset User Password</button>
                    </Link>
                    <Link to="/admin/comments/all">
                        <button className={styles.navButton}>View All Comments</button>
                    </Link>
                    <Link to="/admin/comments/reported">
                        <button className={styles.navButton}>View Reported Comments</button>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default AdminPanel;
