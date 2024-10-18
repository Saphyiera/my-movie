import styles from "./styles.module.css"

function LoginPage() {
    return (
        <>
            <div className={styles.loginPage}>
                <h1>Login Page</h1>
                <div className={styles.loginContainer}>
                    <h2>Welcome Back!</h2>
                    <form className={styles.loginForm}>
                        <label className={styles.inputLabel}>Username: </label> <br></br>
                        <input type="text" id="name" name="userName" className={styles.inputText} placeholder="Enter your username"></input><br></br>
                        <label className={styles.inputLabel}>Password: </label> <br></br>
                        <input type="password" id="password" name="passwd" className={styles.inputText} placeholder="Enter your password"></input><br></br>
                        <input type="submit" value="Login" name="loginBtn" className={styles.loginBtn}></input>
                    </form>
                    <p>New member? <a href="./">Sign up now</a></p>
                </div>
            </div>
        </>
    );
}

export default LoginPage;