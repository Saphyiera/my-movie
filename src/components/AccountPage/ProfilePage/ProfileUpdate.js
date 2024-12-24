import React, { useState } from "react";
import ProfilePictureUpload from "./ProfilePictureUpload";
import UpdateUserEmail from "./UpdateUserEmail";
import UpdateUserInfo from "./UpdateUserInfo";

const ProfileUpdate = ({ userId, refresh }) => {
    const [showPictureUpload, setShowPictureUpload] = useState(false);
    const [showUpdateEmail, setShowUpdateEmail] = useState(false);
    const [showUpdateInfo, setShowUpdateInfo] = useState(false);

    return (
        <div style={styles.container}>
            {/* Profile Picture Upload */}
            <div style={styles.section}>
                <button
                    onClick={() => setShowPictureUpload((prev) => !prev)}
                    style={styles.toggleButton}
                >
                    {showPictureUpload
                        ? "Hide Profile Picture Upload"
                        : "Show Profile Picture Upload"}
                </button>
                {showPictureUpload && (
                    <ProfilePictureUpload userId={userId} refresh={refresh} />
                )}
            </div>

            {/* Update User Email */}
            <div style={styles.section}>
                <button
                    onClick={() => setShowUpdateEmail((prev) => !prev)}
                    style={styles.toggleButton}
                >
                    {showUpdateEmail
                        ? "Hide Update Email"
                        : "Show Update Email"}
                </button>
                {showUpdateEmail && (
                    <UpdateUserEmail userId={userId} refresh={refresh} />
                )}
            </div>

            {/* Update User Info */}
            <div style={styles.section}>
                <button
                    onClick={() => setShowUpdateInfo((prev) => !prev)}
                    style={styles.toggleButton}
                >
                    {showUpdateInfo
                        ? "Hide Update Info"
                        : "Show Update Info"}
                </button>
                {showUpdateInfo && (
                    <UpdateUserInfo userId={userId} refresh={refresh} />
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        marginTop: "20px",
    },
    title: {
        textAlign: "center",
        marginBottom: "20px",
    },
    section: {
        marginBottom: "15px",
    },
    toggleButton: {
        margin: "10px auto",
        padding: "10px 20px",
        backgroundColor: 'cornflowerblue',
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "bold",
    },
};

export default ProfileUpdate;
