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

    // Get profile data
    let fullName = document.getElementById("fullName").value;
    let bio = document.getElementById("bio").value;
    let accountType = document.querySelector('input[name="accountType"]:checked').value;

    // Store credentials and profile in localStorage
    localStorage.setItem("registeredEmail", email);
    localStorage.setItem("registeredPassword", password);
    localStorage.setItem("userFullName", fullName);
    localStorage.setItem("userBio", bio);
    localStorage.setItem("userAccountType", accountType);
    localStorage.setItem("userProfilePic", "https://i.pravatar.cc/150?u=" + email);

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

    alert("Login successful!");
    return true;
}
