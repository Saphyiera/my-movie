import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css"

function LoginPage() {
    const navigate = useNavigate();

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

    const handleLogin = async (event) => {
        event.preventDefault();
        const username = document.getElementById("name").value;
        const password = document.getElementById("password").value;

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

            const response = await fetch('http://localhost:2811/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    password: encryptedPasswordBase64,
                }),
            });
            const result = await response.json();
            if (response.status === 200) {
                console.log(result);
                localStorage.setItem('token', result.token);
                localStorage.setItem('id', result.data.id);
                navigate('../profile');
            }
            else {
                document.getElementById('errorMessage').innerHTML = result.message;
            }
        } catch (err) {
            console.log("Encryption error:", err);
        }
    }

    return (
        <>
            <div className={styles.loginPage}>
                <h1 className={styles.h1}>Login To Your Account!</h1>
                <div className={styles.loginContainer}>
                    <h2 className={styles.h2}>Welcome Back!</h2>
                    <form className={styles.loginForm} onSubmit={handleLogin}>
                        <label className={styles.inputLabel}>Username: </label> <br></br>
                        <input type="text" id="name" name="userName" className={styles.inputText} placeholder="Enter your username"></input><br></br>
                        <label className={styles.inputLabel}>Password: </label> <br></br>
                        <input type="password" id="password" name="passwd" className={styles.inputText} placeholder="Enter your password"></input><br></br>
                        <input type="submit" value="Login" name="loginBtn" className={styles.loginBtn}></input>
                    </form>
                    <div id="errorMessage" className={styles.errorMessage}></div> {/* Error message container */}
                    <p className={styles.p}>New member? <a href="./signup" className={styles.a}>Sign up now</a></p>
                </div>
            </div>
        </>
    );
}

export default LoginPage;