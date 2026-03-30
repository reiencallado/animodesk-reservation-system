const bcrypt = require("bcrypt");
const User = require("../../models/User");
const Reservation = require("../../models/Reservation");
const { isValidEmail, isValidPassword } = require("../middlewares/validation");

/**
 * Helper function to send standardized error responses in user controller.
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 */
const sendError = (res, status, message) => res.status(status).json({ success: false, message });


const EXCLUDED_USER_NAMES = [
    "Bravado",
    "John Doe",
    "Jane Doe",
    "Philippe Marquez",
    "Worlding",
];

const STUDENT_ROLES = ["student", "Student"];

/**
 * Retrieves students only (student role), excluding specific names, with limited fields.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {JSON} Array of student users or 500 error
 */
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $in: STUDENT_ROLES }, name: { $nin: EXCLUDED_USER_NAMES } }).select("_id name email");
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Error fetching users");
    }
};


/**
 * Retrieves detailed student profiles excluding specific names.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {JSON} Array of student objects or 500 error
 */
exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: { $in: STUDENT_ROLES }, name: { $nin: EXCLUDED_USER_NAMES } })
            .select("_id name email studentId profilePic description role");
        res.json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).send("Error loading students");
    }
};


/**
 * Retrieves all users (all roles) excluding specific names, with full profile fields.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {JSON} Array of user objects or 500 error
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ name: { $nin: EXCLUDED_USER_NAMES } }).select("_id name email role studentId profilePic description");
        res.json(users);
    } catch (error) {
        console.error("Error loading users", error);
        res.status(500).send("Error loading users");
    }
};


/**
 * Retrieves a specific user profile by ID, excluding excluded names.
 * @param {Object} req - Express request with params.id
 * @param {Object} res - Express response
 * @returns {JSON} User profile or 404/500 error
 */
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, name: { $nin: EXCLUDED_USER_NAMES } }).select("_id name email role studentId profilePic description");
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        res.json({ success: true, user });
    } catch (error) {
        console.error("Error loading user", error);
        res.status(500).send("Error loading user");
    }
};


/**
 * Retrieves the authenticated user's profile (hides password).
 * @param {Object} req - Express request with session.userId
 * @param {Object} res - Express response
 * @returns {JSON} User profile or error
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select("-password");
        if (!user) {
            return sendError(res, 404, "User not found.");
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error("Profile fetch error:", error);
        sendError(res, 500, "Server error fetching profile.");
    }
};


/**
 * Updates the authenticated user's profile (name, email, pic, bio, password).
 * Validates changes, requires current password for password update, updates session.
 * @param {Object} req - Express request with session.userId and body fields
 * @param {Object} res - Express response
 * @returns {JSON} Updated user data or error
 */
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, profilePic, description, currentPassword, newPassword } = req.body;
        const userId = req.session.userId;

        if (email && !isValidEmail(email)) {
            return sendError(res, 400, "Please use a valid DLSU email address.");
        }

        if (newPassword && !isValidPassword(newPassword)) {
            return sendError(res, 400, "New password must be at least 8 characters long and include uppercase, lowercase, and a number.");
        }

        const user = await User.findById(userId);
        if (!user) {
            return sendError(res, 404, "User not found.");
        }

        if (newPassword) {
            if (!currentPassword) {
                return sendError(res, 400, "Current password is required to change password.");
            }

            const match = await bcrypt.compare(currentPassword, user.password);
            if (!match) {
                return sendError(res, 401, "Current password is incorrect.");
            }

            user.password = newPassword;
        }

        if (name) user.name = name.trim();
        if (email) user.email = email;
        if (typeof profilePic !== "undefined") user.profilePic = profilePic;
        if (typeof description !== "undefined") user.description = description;

        await user.save();

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
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePic: user.profilePic || "",
                description: user.description || ""
            }
        });
    } catch (error) {
        console.error("Profile update error:", error);
        sendError(res, 500, "Server error during profile update.");
    }
};


/**
 * Permanently deletes authenticated user account and their reservations, destroys session.
 * @param {Object} req - Express request with session.userId
 * @param {Object} res - Express response
 * @returns {JSON} Success message or error
 */
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.session.userId;
        await Reservation.deleteMany({ userId });
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return sendError(res, 404, "User not found.");
        }

        req.session.destroy((err) => {
            if (err) {
                console.error("Session destroy error:", err);
            }
            res.json({ success: true, message: "Account deleted successfully." });
        });
    } catch (error) {
        console.error("Account deletion error:", error);
        sendError(res, 500, "Server error during account deletion.");
    }
};

