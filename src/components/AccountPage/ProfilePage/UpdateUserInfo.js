import React, { useState } from 'react';

const UpdateUserInfo = ({ userId, refresh }) => {
    const [info, setInfo] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async () => {
        if (!info) return alert('Please enter your info.');

        setIsUpdating(true);
        try {
            const response = await fetch('http://localhost:2811/user/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, info }),
            });

            if (!response.ok) throw new Error('Failed to update info');

            alert('Info updated successfully!');
            if (refresh) {
                refresh();
            }
        } catch (error) {
            alert('Error updating user info.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Update Info</h3>
            <textarea
                placeholder="Enter your new info"
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                style={styles.textarea}
            />
            <button
                onClick={handleUpdate}
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
    textarea: {
        width: '100%',
        height: '80px',
        marginBottom: '15px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        resize: 'none',
    },
    button: {
        padding: '10px 20px',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};

export default UpdateUserInfo;
