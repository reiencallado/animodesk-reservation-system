const bcrypt = require("bcrypt");
const User = require("../../models/User");
const { isValidEmail, isValidPassword, isValidRole } = require("../middlewares/validation");

/**
 * Helper function to send standardized JSON error responses across auth controllers.
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code (e.g., 400, 401, 500)
 * @param {string} message - Descriptive error message for client
 */
const sendError = (res, status, message) => res.status(status).json({ success: false, message });


/**
 * Authenticates user login using email and password.
 * Hashes comparison using bcrypt, creates session, returns user data.
 * @param {Object} req - Express request with body {email, password} and session
 * @param {Object} res - Express response
 * @returns {JSON} User data and success status or error message
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;


        if (!email || !password) {
            return sendError(res, 400, "Email and password are required.");
        }

        if (!isValidEmail(email)) {
            return sendError(res, 400, "Please use a valid DLSU email address.");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 401, "Invalid email or password.");
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return sendError(res, 401, "Invalid email or password.");
        }

        req.session.userId = user._id;
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic || "",
            description: user.description || ""
        };

        res.json({
            success: true,
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic || "",
            description: user.description || ""
        });
    } catch (error) {
        console.error("Login error:", error);
        sendError(res, 500, "Server error during login.");
    }
};

/**
 * Registers a new user account with validation.
 * Generates random studentId, hashes password via model hook, sets default profile pic.
 * @param {Object} req - Express request with body {email, pass, accountType, name}
 * @param {Object} res - Express response
 * @returns {JSON} Success with userId/role/email or error
 */
exports.register = async (req, res) => {
    try {
        const { email, pass, accountType, name } = req.body;


        if (!email || !pass || !accountType || !name) {
            return sendError(res, 400, "Email, password, account type, and name are required.");
        }

        if (!isValidEmail(email)) {
            return sendError(res, 400, "Please use a valid DLSU email address.");
        }

        if (!isValidPassword(pass)) {
            return sendError(res, 400, "Password must be at least 8 characters long and include uppercase, lowercase, and a number.");
        }

        if (!isValidRole(accountType)) {
            return sendError(res, 400, "Invalid account type.");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, 409, "Email already taken. Did you instead forget password?");
        }

        const user = new User({
            studentId: Math.floor(Math.random() * 100000000),
            name: name.trim(),
            email,
            password: pass,
            role: accountType,
            profilePic: '/images/defaultpfp.jpg'
        });

        await user.save();
        res.status(201).json({ success: true, userId: user._id, email: user.email, role: user.role });
    } catch (error) {
        console.error("Registration error:", error);
        sendError(res, 500, "Server error during registration.");
    }
};

/**
 * Checks if email exists for password reset flow (doesn't reveal if exists for security).
 * @param {Object} req - Express request with body {email}
 * @param {Object} res - Express response
 * @returns {JSON} Generic success or validation error
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;


        if (!email || !isValidEmail(email)) {
            return sendError(res, 400, "Please use a valid DLSU email address.");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Email not registered." });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Forgot password error:", error);
        sendError(res, 500, "Server error.");
    }
};

/**
 * Resets user password for given email (password hashed via model hook).
 * @param {Object} req - Express request with body {email, password}
 * @param {Object} res - Express response
 * @returns {JSON} Success or error
 */
exports.resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;


        if (!email || !password) {
            return sendError(res, 400, "Email and new password are required.");
        }

        if (!isValidEmail(email)) {
            return sendError(res, 400, "Please use a valid DLSU email address.");
        }

        if (!isValidPassword(password)) {
            return sendError(res, 400, "Password must be at least 8 characters long and include uppercase, lowercase, and a number.");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        user.password = password;
        await user.save();

        res.json({ success: true });
    } catch (error) {
        console.error("Reset password error:", error);
        sendError(res, 500, "Server error.");
    }
};

/**
 * Destroys user session to log out.
 * @param {Object} req - Express request with session
 * @param {Object} res - Express response
 * @returns {JSON} Success or server error
 */
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).json({ success: false, message: "Error during logout." });
        }
        res.json({ success: true, message: "Logged out successfully." });
    });
};

