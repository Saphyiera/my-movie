import React from "react"; // Import React
import styles from "./styles.module.css";
import { validatePassword, validateEmail } from "../../../model/Login/LoginAuth";

function SignupPage() {
    const str2ab = (str) => {
        const binaryString = window.atob(str.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, '').replace(/\n/g, ''));
        const length = binaryString.length;
        const arrayBuffer = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            arrayBuffer[i] = binaryString.charCodeAt(i);
        }
        return arrayBuffer.buffer;
    };

    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const length = bytes.byteLength;
        for (let i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const username = document.getElementById("name").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const email = document.getElementById("email").value;

        const validationResult = validatePassword(password);
        const isEmail = validateEmail(email);

        if (validationResult === "Password is valid.") {
            if (password === confirmPassword) {
                if (!isEmail) {
                    document.getElementById("errorMessage").innerText = "Please enter a valid email";
                    document.getElementById("success").innerText = "";
                } else {
                    let publicKey = localStorage.getItem('publicKey');
                    console.log(publicKey)
                    if (!publicKey) {
                        const result = await fetch(`http://localhost:2811/public-key`);
                        publicKey = await result.text();
                        if (result.status === 200) {
                            localStorage.setItem('publicKey', publicKey);
                        }
                        else {
                            console.log(await result.text());
                        }
                    }
                    try {
                        const encoder = new TextEncoder();
                        const passwordBuffer = encoder.encode(password);

                        const publicKeyImport = await window.crypto.subtle.importKey(
                            'spki',
                            str2ab(publicKey),
                            { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
                            false,
                            ['encrypt']
                        );

                        const encryptedPassword = await window.crypto.subtle.encrypt(
                            { name: 'RSA-OAEP' },
                            publicKeyImport,
                            passwordBuffer
                        );

                        const encryptedPasswordBase64 = arrayBufferToBase64(encryptedPassword);

                        const response = await fetch('http://localhost:2811/signup', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                username: username,
                                email: email,
                                password: encryptedPasswordBase64,
                            }),
                        });
                        const result = await response.json();
                        if (response.status === 200) {
                            document.getElementById("errorMessage").innerText = "";
                            document.getElementById("success").innerText = "Done, please go to login page to continue!";
                        }
                        else {
                            document.getElementById("success").innerText = "";
                            document.getElementById("errorMessage").innerText = result.message;
                        }
                    } catch (err) {
                        console.log("Encryption error:", err);
                        document.getElementById("errorMessage").innerText = "Error during encryption.";
                    }
                }
            } else {
                document.getElementById("success").innerText = "";
                document.getElementById("errorMessage").innerText = "Passwords do not match.";
            }
        } else {
            document.getElementById("success").innerText = "";
            document.getElementById("errorMessage").innerText = validationResult;
        }
    };

    return (
        <div className={styles.signupPage}>
            <h1 className={styles.signupTitle}>Welcome to Project Movie Website!</h1>
            <div className={styles.loginContainer}>
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <h2 className={styles.signupInstruction}>Fill your account information</h2>
                    <label className={styles.inputLabel}>Username: </label>
                    <input type="text" id="name" name="userNameSignup" className={styles.inputText} placeholder="Enter your username" /><br />
                    <label className={styles.inputLabel}>Email: </label>
                    <input type="text" id="email" name="emailSignup" className={styles.inputText} placeholder="Enter your email" /><br />
                    <label className={styles.inputLabel}>Password: </label>
                    <input type="password" id="password" name="passwdSignup" className={styles.inputText} placeholder="Enter your password" /><br />
                    <label className={styles.inputLabel}>Confirm Password: </label>
                    <input type="password" id="confirmPassword" name="passwdRetype" className={styles.inputText} placeholder="Retype your password" /><br />
                    <input type="submit" value="Create Account" name="signupBtn" className={styles.signupBtn} /><br />
                </form>
                <div id="errorMessage" className={styles.errorMessage}></div> {/* Error message container */}
                <div id="success"></div>
                <p className={styles.signupText}>Already own an account? <a href="./login" className={styles.loginLink}>Log in.</a></p>
            </div>
        </div>
    );
}

export default SignupPage;
