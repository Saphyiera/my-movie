export function validatePassword(password) {
    let res = "";
    // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character
    const minLength = 8;
    const upperCase = /[A-Z]/;
    const lowerCase = /[a-z]/;
    const numbers = /[0-9]/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;
    const xssDangerousChars = /[<>"/'&]/; // XSS-prone characters
    const sqlInjectionChars = /[;'"--]/; // SQL injection characters and comments
    const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|DROP|ALTER|CREATE|EXEC|EXECUTE|AND|OR|NOT|LIKE)\b/i; // Common SQL keywords

    if (password.length < minLength) {
        res = "Password must be at least 8 characters long.";
    }

    else if (xssDangerousChars.test(password)) {
        res = "Password contains invalid characters (e.g., <, >, \", ', &).";
    }

    else if (sqlInjectionChars.test(password)) {
        res = "Password contains invalid characters (e.g., ;, ', --).";
    }

    else if (sqlKeywords.test(password)) {
        res = "Password cannot contain SQL keywords.";
    }

    else if (!upperCase.test(password)) {
        res = "Password must contain at least one uppercase letter.";
    }

    else if (!lowerCase.test(password)) {
        res = "Password must contain at least one lowercase letter.";
    }

    else if (!numbers.test(password)) {
        res = "Password must contain at least one number.";
    }

    else if (!specialChar.test(password)) {
        res = "Password must contain at least one special character.";
    }
    else {
        res = "Password is valid.";
    }
    return res;
}