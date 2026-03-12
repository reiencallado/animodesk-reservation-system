// register validation
function validateRegister() {
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

    let fullName    = document.getElementById("fullName").value;
    let bio         = document.getElementById("bio").value;
    let accountType = document.querySelector('input[name="accountType"]:checked').value;

    localStorage.setItem("registeredEmail",  email);
    localStorage.setItem("registeredPassword", password);
    localStorage.setItem("userFullName",     fullName);
    localStorage.setItem("userBio",          bio);
    localStorage.setItem("userAccountType",  accountType);
    localStorage.setItem("userProfilePic",   "https://i.pravatar.cc/150?u=" + email);

    alert("Registration successful!");
    return true;
}

// Login validation
function validateLogin() {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert(data.message || "Login failed. Please check your credentials.");
            return;
        }

        // save everything we need
        localStorage.setItem("userId",          data.userId);
        localStorage.setItem("userFullName",     data.name);
        localStorage.setItem("registeredEmail",  data.email);
        localStorage.setItem("userBio",          data.description);
        localStorage.setItem("userAccountType",  data.role);
        localStorage.setItem("userProfilePic",   data.profilePic || "https://i.pravatar.cc/150?u=" + data.email);

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
