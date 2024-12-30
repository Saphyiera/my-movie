import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import SendAdminMailModal from "./SendAdminMailModal/SendAdminMailModal";
import { useNavigate } from "react-router-dom";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedUserEmail, setSelectedUserEmail] = useState(null);
    const navigate = useNavigate();

    const fetchUsers = async (page) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:2811/admin/users?page=${page}`);
            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }
            const { data, meta } = await response.json();
            setUsers(data);
            setCurrentPage(meta.currentPage);
            setTotalPages(meta.totalPages);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        try {
            const response = await fetch("http://localhost:2811/admin/user", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete user");
            }

            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
            alert("User deleted successfully");
        } catch (err) {
            console.error(err.message);
            alert("Error deleting user: " + err.message);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Users</h2>
            <ul className={styles.userList}>
                {users.map((user) => (<>
                    <li key={user.id} className={styles.userCard} onClick={() => navigate('/user/guest/' + user.id)}>
                        <img
                            src={user.profile_picture || "https://via.placeholder.com/50"}
                            alt={`${user.username}'s profile`}
                            className={styles.profilePicture}
                        />
                        <div>
                            <h3 className={styles.username}>{user.username}</h3>
                            <p className={styles.userInfo}>Email: {user.email}</p>
                            <p className={styles.userInfo}>
                                Info: {user.info || "No additional info"}
                            </p>
                            <p className={styles.userInfo}>
                                Created At: {new Date(user.created_at).toLocaleString()}
                            </p>
                            <p className={styles.userInfo}>
                                Verified: {user.email_is_verified ? "Yes" : "No"}
                            </p>
                        </div>

                    </li>
                    <div className={styles.buttonContainer}>
                        <button onClick={() => setSelectedUserEmail(user.email)} className={styles.sendEmailButton} >
                            Send Email
                        </button>
                        <button onClick={() => deleteUser(user.id)} className={styles.secondaryButton} >
                            Delete
                        </button>
                    </div></>
                ))}
            </ul>
            {selectedUserEmail && (
                <SendAdminMailModal
                    email={selectedUserEmail}
                    onClose={() => setSelectedUserEmail(null)}
                />
            )}
            <div className={styles.pagination}>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles.paginationButton}
                >
                    Previous
                </button>
                <span className={styles.paginationInfo}>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={styles.paginationButton}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Users;