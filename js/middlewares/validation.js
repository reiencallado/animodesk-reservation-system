const emailRegex = /^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Validates if email is a valid DLSU email address using regex.
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid DLSU email format
 */
function isValidEmail(email) {
    return typeof email === "string" && emailRegex.test(email);
}


/**
 * Validates password strength: min 8 chars, uppercase, lowercase, number.
 * @param {string} password - Password to validate
 * @returns {boolean} True if meets strength requirements
 */
function isValidPassword(password) {
    return typeof password === "string" && passwordRegex.test(password);
}


/**
 * Validates if role is allowed ('student' or 'labTechnician').
 * @param {string} role - Role to check
 * @returns {boolean} True if valid role
 */
function isValidRole(role) {
    return role === "student" || role === "labTechnician";
}


/**
 * Express middleware to check if user is authenticated via session.userId.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {function} next - Next middleware callback
 */
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
