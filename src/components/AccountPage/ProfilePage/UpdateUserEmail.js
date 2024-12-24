import React, { useState } from 'react';

const UpdateUserEmail = ({ userId, refresh }) => {
    const [email, setEmail] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdateEmail = async () => {
        if (!email) return alert('Please enter your email.');

        setIsUpdating(true);
        try {
            const response = await fetch('http://localhost:2811/user/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, email }),
            });

            if (!response.ok) throw new Error('Failed to update email');

            alert('Email updated successfully!');
            if (refresh) {
                refresh();
            }
        } catch (error) {
            alert('Error updating email.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Update Email</h3>
            <input
                type="email"
                placeholder="Enter your new email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
            />
            <button
                onClick={handleUpdateEmail}
                disabled={isUpdating}
                style={{ ...styles.button, backgroundColor: isUpdating ? '#aaa' : 'cornflowerblue' }}
            >
                {isUpdating ? 'Updating...' : 'Update'}
            </button>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        margin: '10px auto',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    title: { marginBottom: '15px', fontSize: '1.2em' },
    input: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        border: '1px solid #ccc',
        borderRadius: '5px',
    },
    button: {
        padding: '10px 20px',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};

export default UpdateUserEmail;
