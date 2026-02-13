// register validation
function validateRegister() {

    let email = document.getElementById("dlsuEmail").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    let emailreg = /^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/;
    if (!emailreg.test(email)) {
        alert("Please enter a valid DLSU email (example@dlsu.edu.ph).");
        return false;
    }

    let passreg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passreg.test(password)) {
        alert("Password must be at least 8 characters long and include uppercase, lowercase, and a number.");
        return false;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return false;
    }

    alert("Registration successful!");
    return true;
}


// login validation
function validateLogin() {

    let email = document.getElementById("dlsuEmail").value;
    let password = document.getElementById("password").value;

    let emailreg = /^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/;
    if (!emailreg.test(email)) {
        alert("Please enter a valid DLSU email (example@dlsu.edu.ph).");
        return false;
    }

    if (password.length === 0) {
        alert("Please enter your password.");
        return false;
    }

    alert("Login successful!");
    return true;
}
