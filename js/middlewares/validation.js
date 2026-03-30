const emailRegex = /^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function isValidEmail(email) {
    return typeof email === "string" && emailRegex.test(email);
}

function isValidPassword(password) {
    return typeof password === "string" && passwordRegex.test(password);
}

function isValidRole(role) {
    return role === "student" || role === "labTechnician";
}

function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, message: "Authentication required." });
    }
    next();
}

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidRole,
    requireAuth
};
