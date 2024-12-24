import React, { useState } from 'react';

const ProfilePictureUpload = ({ userId, refresh }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadClick = async () => {
        if (!image) {
            alert('Please select an image to upload.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', image);
        formData.append('userId', userId);

        try {
            const response = await fetch('http://localhost:2811/user/profile-picture', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to upload profile picture');

            const result = await response.json();
            alert(result.message);
            if (refresh) {
                refresh();
            }
        } catch (error) {
            alert('Error uploading profile picture!');
        } finally {
            setIsUploading(false);
            setImage(null);
            setPreview(null);
        }
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Upload Profile Picture</h3>
            <input type="file" accept="image/*" onChange={handleFileChange} style={styles.input} />
            {preview && (
                <div style={styles.previewContainer}>
                    <img src={preview} alt="Preview" style={styles.previewImage} />
                </div>
            )}
            <button
                onClick={handleUploadClick}
                disabled={isUploading}
                style={{ ...styles.button, backgroundColor: isUploading ? '#aaa' : 'cornflowerblue' }}
            >
                {isUploading ? 'Uploading...' : 'Upload'}
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
    input: { marginBottom: '15px' },
    previewContainer: { marginBottom: '15px' },
    previewImage: {
        width: '150px',
        height: '150px',
        objectFit: 'cover',
        borderRadius: '50%',
        border: '2px solid #ccc',
    },
    button: {
        padding: '10px 20px',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};

export default ProfilePictureUpload;
