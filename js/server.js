const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const User = require("../models/User");
const Lab = require("../models/Lab");
const Reservation = require("../models/Reservation");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const labRoutes = require("./routes/labRoutes");

const app = express();
const PORT = 3000;

const emailRegex = /^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function isValidEmail(email) {
    return typeof email === 'string' && emailRegex.test(email);
}

function isValidPassword(password) {
    return typeof password === 'string' && passwordRegex.test(password);
}

function isValidRole(role) {
    return role === 'student' || role === 'labTechnician';
}

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    next();
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/.."));

// Session middleware
app.use(session({
    secret: 'your-secret-key', // Change this to a secure secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        sameSite: 'lax'
    }
}));

mongoose.connect("mongodb://localhost:27017/animodesk")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
    res.send("Server is running");
});

// Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: "Please use a valid DLSU email address." });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        // Set session data
        req.session.userId = user._id;
        req.session.email = user.email;
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
        res.status(500).json({ success: false, message: "Server error during login." });
    }
});

// Forgot Password
app.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ success: false, message: "Please use a valid DLSU email address." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: "Email not registered."
            });
        }

        res.json({
            success: true
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }

});

// Reset Password
app.post("/reset-password", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and new password are required." });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: "Please use a valid DLSU email address." });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long and include uppercase, lowercase, and a number." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        user.password = password;
        await user.save();

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).json({ success: false, message: "Error during logout." });
        }
        res.json({ success: true, message: "Logged out successfully." });
    });
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.find({ role: "student" }).select("_id name email");
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Error fetching users");
    }
});

app.get("/users/students", async (req, res) => {
    try {
        const students = await User.find({ role: "student" }).select("_id name email studentId");
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading students");
    }
});


// Registration
app.post("/register", async (req, res) => {
    try {
        const { email, pass, accountType, name } = req.body;

        if (!email || !pass || !accountType || !name) {
            return res.status(400).json({ success: false, message: "Email, password, account type, and name are required." });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: "Please use a valid DLSU email address." });
        }

        if (!isValidPassword(pass)) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long and include uppercase, lowercase, and a number." });
        }

        if (!isValidRole(accountType)) {
            return res.status(400).json({ success: false, message: "Invalid account type." });
        }

        const checkuser = await User.findOne({ email });
        if (checkuser) {
            return res.status(401).json({ success: false, message: "Email already taken. Did you instead forget password?" });
        }

        const user = new User({
            studentId: Math.floor(Math.random() * 100000000),
            name: name.trim(),
            email: email,
            password: pass,
            role: accountType
        });

        await user.save();
        console.log("New User Created: ", user._id, user.studentId, user.name, "(hashed)", user.email, user.role);
        res.json({ success: true, userId: user._id, email: user.email, role: user.role });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Server error during registration." });
    }
});

// Get profile data
app.get("/profile", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: "Not authenticated." });
        }
        const user = await User.findById(req.session.userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ success: false, message: "Server error fetching profile." });
    }
});

// Edit profile
app.put("/profile", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: "Not authenticated." });
        }

        const { name, email, profilePic, description, currentPassword, newPassword } = req.body;
        const userId = req.session.userId;

        // If changing password, verify current password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: "Current password is required to change password." });
            }
            if (!isValidPassword(newPassword)) {
                return res.status(400).json({ success: false, message: "New password must be at least 8 characters long and include uppercase, lowercase, and a number." });
            }
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }
            const match = await bcrypt.compare(currentPassword, user.password);
            if (!match) {
                return res.status(401).json({ success: false, message: "Current password is incorrect." });
            }
            user.password = newPassword;
            await user.save();
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, profilePic, description },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Update session data
        req.session.user = {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profilePic: updatedUser.profilePic || "",
            description: updatedUser.description || ""
        };

        res.json({
            success: true,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                profilePic: updatedUser.profilePic || "",
                description: updatedUser.description || ""
            }
        });

    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ success: false, message: "Server error during profile update." });
    }
});

// Delete account
app.delete("/user", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: "Not authenticated." });
        }

        const userId = req.session.userId;

        // Delete user's reservations first
        await Reservation.deleteMany({ userId });

        // Delete the user
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                console.error("Session destroy error:", err);
            }
            res.json({ success: true, message: "Account deleted successfully." });
        });

    } catch (error) {
        console.error("Account deletion error:", error);
        res.status(500).json({ success: false, message: "Server error during account deletion." });
    }
});

// Student self reservation
app.post("/reserve", requireAuth, async (req, res) => {
    try {
        const { labId, date, timeSlot, seats, anonymous, userId } = req.body;
        const seatNumbers = seats.split(",").map(Number);
        // prefer session userId when available
        const uid = req.session.userId || userId || null;

        const reservation = new Reservation({
            userId: uid,
            labId,
            date,
            timeSlot,
            seats: seatNumbers,
            anonymous: anonymous === "on",
            status: "active"
        });

        await reservation.save();
        console.log("Reservation saved:", reservation);
        res.redirect("/student.html");
    } catch (error) {
        console.error("Error saving reservation:", error);
        res.send("Reservation failed.");
    }
});

// Technician reserve for a student
app.post("/reserve-technician", requireAuth, async (req, res) => {
    try {
        const { labId, date, timeSlot, seats, studentId } = req.body;
        const seatNumbers = seats.split(",").map(Number);

        const reservation = new Reservation({
            labId,
            date,
            timeSlot,
            seats: seatNumbers,
            anonymous: false,
            createdByTechnician: true,
            userId: studentId,
            reservedFor: studentId || null,
            status: "active"
        });

        await reservation.save();
        console.log("Technician reservation saved:", reservation);
        res.redirect("/technician.html");
    } catch (error) {
        console.error("Error saving technician reservation:", error);
        res.send("Reservation failed.");
    }
});

app.get("/student-reservations", async (req, res) => {
    try {
        // Get user ID based on session
        const userId = req.session.userId;

        // Error due to session issues
        if (!userId) {
            return res.status(401).json({ error: "Error, please login again" });
        }

        // Sort out Reservations based on userId
        const reservations = await Reservation.find({ userId }).sort({ date: 1 });

        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error Getting Reservations");
    }
});

app.delete("/del-student-reservation/:id", async (req, res) => {
    try {

        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({error: "Error, please login again"})
        }
        const deleted = await Reservation.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(402).send("Reservation not found");
        }

        console.log("User has cancelled reservation: ", req.params.id);
        res.send("Reservation cancelled");

    } catch (error) {
        console.error(error);
        res.status(500).send("Error cancelling reservation");
    }
})


// Reservations for lab + date + timeslot
app.get("/reservations", async (req, res) => {
    try {
        const { labId, date, timeSlot } = req.query;
        const reservations = await Reservation.find({ labId, date, timeSlot });
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading reservations");
    }
});

// Technician manage table
app.get("/all-reservations", async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ date: 1, timeSlot: 1 });

        const enriched = await Promise.all(reservations.map(async (r) => {
            const obj = r.toObject();

            if (r.anonymous) {
                obj.studentName = "Anonymous";
            } else {
                const lookupId = r.userId || r.reservedFor;
                if (lookupId) {
                    const user = await User.findById(lookupId).select("name");
                    obj.studentName = user ? user.name : "Unknown Student";
                } else {
                    obj.studentName = "Unknown Student";
                }
            }

            return obj;
        }));

        res.json(enriched);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading reservations");
    }
});

// Edit a reservation
app.patch("/reservations/:id", async (req, res) => {
    try {
        const { labId, date, timeSlot, seats, anonymous } = req.body;
        const updated = await Reservation.findByIdAndUpdate(
            req.params.id,
            { labId, date, timeSlot, seats, anonymous },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).send("Reservation not found.");
        }
        console.log("Reservation updated:", updated);
        res.json(updated);
    } catch (error) {
        console.error("Error updating reservation:", error);
        res.status(500).send("Error updating reservation.");
    }
});

// Delete a reservation
app.delete("/reservations/:id", async (req, res) => {
    try {
        const deleted = await Reservation.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).send("Reservation not found.");
        }
        console.log("Reservation deleted (no-show):", req.params.id);
        res.send("Reservation deleted.");
    } catch (error) {
        console.error("Error deleting reservation:", error);
        res.status(500).send("Error deleting reservation.");
    }
});

// Get all users for directory
app.get("/users/all", async (req, res) => {
    try {
        const users = await User.find().select("_id name email role studentId profilePic description");
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading users");
    }
});

app.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("_id name email role studentId profilePic description");
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading user");
    }
});

app.get("/reservations-with-users", async (req, res) => {
    try {
        const { labId, date, timeSlot } = req.query;
        const reservations = await Reservation.find({ labId, date, timeSlot });

        const enriched = await Promise.all(reservations.map(async (r) => {
            const obj = r.toObject();
            if (!r.anonymous) {
                const lookupId = r.userId || r.reservedFor;
                if (lookupId) {
                    const user = await User.findById(lookupId).select("name _id");
                    obj.reserveeName = user ? user.name : null;
                    obj.reserveeId   = user ? user._id  : null;
                }
            }
            return obj;
        }));

        res.json(enriched);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading reservations");
    }
});

// Creating new users to reserve
app.get('/seed', async (req, res) => {
  await User.deleteMany({});
  await Reservation.deleteMany({});
  const use1 = await User.create({
    email: 'JohnDoe@dlsu.edu.ph',
    password: '@Hellow0rld',
    role: 'student',
    name: 'John Doe',
    studentId: '12345678',
    profilePic: "/images/defaultpfp.jpg",
    description: 'A generic man'
  });

  const use2 = await User.create({
    email: 'JaneDoe@dlsu.edu.ph',
    password: '@Hellow0rld',
    role: 'student',
    name: 'Jane Doe',
    studentId: '12345677',
    profilePic: "/images/defaultpfp.jpg",
    description: 'A generic woman'
  });

  const use3 = await User.create({
    email: 'Hello@dlsu.edu.ph',
    password: '@Hellow0rld',
    role: 'student',
    name: 'Worlding',
    studentId: '12345679',
    profilePic: "/images/defaultpfp.jpg",
    description: 'Hello'
  });

  const use4 = await User.create({
    email: 'Bravado@dlsu.edu.ph',
    password: '@Hellow0rld',
    role: 'student',
    name: 'Bravado',
    studentId: '1259872',
    profilePic: "/images/defaultpfp.jpg",
    description: 'A man with great ambitions'
  });

  const use5 = await User.create({
    email: 'Philip@dlsu.edu.ph',
    password: '@Hellow0rld',
    role: 'student',
    name: 'Philippe Marquez',
    studentId: '1238977',
    profilePic: "/images/defaultpfp.jpg",
    description: 'An Ambitious and talented learner'

  });

  await Reservation.create({
    userId: use1._id,
    labId: '69afd532f54bb0454f77ab67',
    date: "2026-03-30",
    timeSlot: '07:30 - 08:00',
    seats: [5,3,2],
    reservedFor: use1._id,
    createdByTechnician: false,
    status: "active"
  });

  await Reservation.create({
    userId: use2._id,
    labId: '69afd532f54bb0454f77ab67',
    date: "2026-03-30",
    timeSlot: '07:30 - 08:00',
    seats: [8],
    reservedFor: use2._id,
    createdByTechnician: false,
    status: "active"
  });

  await Reservation.create({
    userId: use3._id,
    labId: '69afd532f54bb0454f77ab67',
    date: "2026-03-30",
    timeSlot: '07:30 - 08:00',
    seats: [13],
    reservedFor: use3._id,
    createdByTechnician: false,
    status: "active"
  });

  await Reservation.create({
    userId: use4._id,
    labId: '69afd532f54bb0454f77ab67',
    date: "2026-03-30",
    timeSlot: '07:30 - 08:00',
    seats: [8,6],
    reservedFor: use4._id,
    createdByTechnician: false,
    status: "active"
  });

  await Reservation.create({
    userId: use5._id,
    labId: '69afd532f54bb0454f77ab67',
    date: "2026-03-30",
    timeSlot: '07:30 - 08:00',
    seats: [20,22],
    reservedFor: use5._id,
    createdByTechnician: false,
    status: "active"
  });



  res.send('Seeded! Return to login!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
