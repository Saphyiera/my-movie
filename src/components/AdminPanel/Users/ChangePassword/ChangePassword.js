import React, { useState } from 'react';
import './ChangePassword.css';

const ChangePassword = () => {
    const [id, setId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleChangePassword = async (e) => {
        e.preventDefault();

        setMessage('');

        try {
            const response = await fetch('http://localhost:2811/admin/user/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, newPassword }),
            });

            if (response.ok) {
                setMessage('Password reset successfully.');
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to reset password.');
            }
        } catch (error) {
            setMessage('Network error: Unable to reset password.');
        }
    };

    return (
        <div className="change-password-container">
            <h2 className="title">Change Password</h2>
            <form onSubmit={handleChangePassword} className="form">
                <div className="form-group">
                    <label htmlFor="id" className="label">User ID:</label>
                    <input
                        type="text"
                        id="id"
                        className="input"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="newPassword" className="label">New Password:</label>
                    <input
                        type="password"
                        id="newPassword"
                        className="input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="button">Change Password</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default ChangePassword;
