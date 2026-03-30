const bcrypt = require("bcrypt");
const User = require("../../models/User");
const Reservation = require("../../models/Reservation");
const { isValidEmail, isValidPassword } = require("../middlewares/validation");

const sendError = (res, status, message) => res.status(status).json({ success: false, message });

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "student" }).select("_id name email");
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Error fetching users");
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: "student" })
            .select("_id name email studentId profilePic description role");
        res.json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).send("Error loading students");
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("_id name email role studentId profilePic description");
        res.json(users);
    } catch (error) {
        console.error("Error loading users", error);
        res.status(500).send("Error loading users");
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("_id name email role studentId profilePic description");
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        res.json({ success: true, user });
    } catch (error) {
        console.error("Error loading user", error);
        res.status(500).send("Error loading user");
    }
};

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
