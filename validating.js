// register validation
function validateRegister(event) {
    event.preventDefault();
    let email           = document.getElementById("dlsuEmail").value;
    let password        = document.getElementById("password").value;
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

     const accountType = document.querySelector('input[name="accountType"]:checked').value;

    const fullName = document.getElementById('fullName').value.trim();
    fetch("http://localhost:3000/register", {
        method: "POST",
        credentials: 'same-origin',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pass: password, accountType, name: fullName })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert(data.message || "Registration failed. Please check credentials.");
            return;
        }

        // update session storage for this browser session
        sessionStorage.setItem("registeredEmail",  data.email);
        sessionStorage.setItem("userAccountType",  data.role);
        sessionStorage.setItem("userProfilePic",   "https://i.pravatar.cc/150?u=" + email);

        window.location.href = "login.html";
    })
    .catch(err => {
        console.error("Registration error:", err);
        alert("Could not connect to server. Make sure the server is running.");
    });

    return false;
}

// Login validation
function validateLogin(event) {
    event.preventDefault();
    const email    = document.getElementById("dlsuEmail").value;
    const password = document.getElementById("password").value;

    let emailreg = /^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/;
    if (!emailreg.test(email)) {
        alert("Please enter a valid DLSU email (example@dlsu.edu.ph).");
        return false;
    }

    event.preventDefault();

    fetch("http://localhost:3000/login", {
        method: "POST",
        credentials: 'same-origin',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert(data.message || "Login failed. Please check your credentials.");
            return;
        }

        // save everything we need for this browser session
        sessionStorage.setItem("userId",          data.userId);
        sessionStorage.setItem("userFullName",     data.name);
        sessionStorage.setItem("registeredEmail",  data.email);
        sessionStorage.setItem("userBio",          data.description);
        sessionStorage.setItem("userAccountType",  data.role);
        sessionStorage.setItem("userProfilePic",   data.profilePic || "https://i.pravatar.cc/150?u=" + data.email);

        if (data.role === "labTechnician") {
            window.location.href = "technician.html";
        } else {
            window.location.href = "student.html";
        }
    })
    .catch(err => {
        console.error("Login error:", err);
        alert("Could not connect to server. Make sure the server is running.");
    });

    return false;
}
