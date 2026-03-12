const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Lab = require("../models/Lab");
const Reservation = require("../models/Reservation");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/.."));

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

        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        res.json({
            success: true,
            userId:  user._id,
            name:    user.name,
            email:   user.email,
            role:    user.role,
            profilePic:  user.profilePic  || "",
            description: user.description || ""
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error during login." });
    }
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
        const { email, pass, accountType } = req.body;
        const checkuser = await User.findOne({email})

        if (checkuser) {
            return res.status(401).json({success: false, message: "Email already taken. Did you instead forget password?"});
        }

        const user = new User({
            studentId: Math.floor(Math.random() * 100000000),
            name: "Bogos Binted",
            email: email,
            password: pass,
            role : accountType
        })
        
        await user.save();
        console.log("New User Created: ", user._id, user.studentId, user.name, user.password, user.email, user.role);
        res.redirect("/login.html")


    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Server error during registration." });
    }
});



// Student self reservation
app.post("/reserve", async (req, res) => {
    try {
        const { labId, date, timeSlot, seats, anonymous, userId } = req.body;
        const seatNumbers = seats.split(",").map(Number);

        const reservation = new Reservation({
            userId: userId || null,
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
app.post("/reserve-technician", async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
