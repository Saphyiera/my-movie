import React from "react"; // Import React
import styles from "./styles.module.css";
import { validatePassword } from "../../model/Login/LoginAuth";

function SignupPage() {
    const handleSubmit = (event) => {
        event.preventDefault();

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const validationResult = validatePassword(password);
        if (validationResult === "Password is valid.") {
            if (password === confirmPassword) {
                document.getElementById("errorMessage").innerText = "";
                document.getElementById("success").innerText = "Done, please go to login page to continue!";
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
            <h1>Sign up for new member!</h1>
            <div className={styles.loginContainer}>
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <h2>Fill your account information</h2>
                    <label className={styles.inputLabel}>Username: </label><br />
                    <input type="text" id="name" name="userNameSignup" className={styles.inputText} placeholder="Enter your username" /><br />
                    <label className={styles.inputLabel}>Password: </label><br />
                    <input type="password" id="password" name="passwdSignup" className={styles.inputText} placeholder="Enter your password" /><br />
                    <label className={styles.inputLabel}>Confirm Password: </label><br />
                    <input type="password" id="confirmPassword" name="passwdRetype" className={styles.inputText} placeholder="Retype your password" /><br />
                    <input type="submit" value="Create Account" name="signupBtn" className={styles.signupBtn} /><br />
                </form>
                <div id="errorMessage" className={styles.errorMessage}></div> {/* Error message container */}
                <div id="success"></div>
                <p>Already own an account? <a href="./">Log in.</a></p>
            </div>
        </div>
    );
}

export default SignupPage;
