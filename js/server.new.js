const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const labRoutes = require("./routes/labRoutes");
const User = require("../models/User");
const Reservation = require("../models/Reservation");
const Lab = require("../models/Lab");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..")));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        sameSite: 'lax'
    }
}));

mongoose.connect("mongodb://localhost:27017/animodesk")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use(authRoutes);
app.use(userRoutes);
app.use(reservationRoutes);
app.use(labRoutes);

app.get('/seed', async (req, res) => {
    try {
        await User.deleteMany({});
        await Reservation.deleteMany({});
        await Lab.deleteMany({});

        const users = await User.create([
            {
                email: 'JohnDoe@dlsu.edu.ph',
                password: '@Hellow0rld',
                role: 'student',
                name: 'John Doe',
                studentId: '12345678',
                description: 'A generic man'
            },
            {
                email: 'JaneDoe@dlsu.edu.ph',
                password: '@Hellow0rld',
                role: 'student',
                name: 'Jane Doe',
                studentId: '12345677',
                description: 'A generic woman'
            },
            {
                email: 'Hello@dlsu.edu.ph',
                password: '@Hellow0rld',
                role: 'student',
                name: 'Worlding',
                studentId: '12345679',
                description: 'Hello'
            },
            {
                email: 'Bravado@dlsu.edu.ph',
                password: '@Hellow0rld',
                role: 'student',
                name: 'Bravado',
                studentId: '1259872',
                description: 'A man with great ambitions'
            },
            {
                email: 'Philip@dlsu.edu.ph',
                password: '@Hellow0rld',
                role: 'student',
                name: 'Philippe Marquez',
                studentId: '1238977',
                description: 'An ambitious and talented learner'
            }
        ]);

        const labs = await Lab.create([
            { name: 'Computer Lab 1', building: 'Owen', totalSeats: 30 },
            { name: 'Computer Lab 2', building: 'Applied Mechanics', totalSeats: 35 }
        ]);

        await Reservation.create([
            {
                userId: users[0]._id,
                labId: labs[0]._id,
                date: "2026-03-30",
                timeSlot: '07:30 - 08:00',
                seats: [5, 3, 2],
                reservedFor: users[0]._id,
                createdByTechnician: false,
                status: "active"
            },
            {
                userId: users[1]._id,
                labId: labs[0]._id,
                date: "2026-03-30",
                timeSlot: '07:30 - 08:00',
                seats: [8],
                reservedFor: users[1]._id,
                createdByTechnician: false,
                status: "active"
            },
            {
                userId: users[2]._id,
                labId: labs[0]._id,
                date: "2026-03-30",
                timeSlot: '07:30 - 08:00',
                seats: [13],
                reservedFor: users[2]._id,
                createdByTechnician: false,
                status: "active"
            },
            {
                userId: users[3]._id,
                labId: labs[0]._id,
                date: "2026-03-30",
                timeSlot: '07:30 - 08:00',
                seats: [8, 6],
                reservedFor: users[3]._id,
                createdByTechnician: false,
                status: "active"
            },
            {
                userId: users[4]._id,
                labId: labs[0]._id,
                date: "2026-03-30",
                timeSlot: '07:30 - 08:00',
                seats: [20, 22],
                reservedFor: users[4]._id,
                createdByTechnician: false,
                status: "active"
            }
        ]);

        res.send('Seeded! Return to login!');
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).send('Seed failed.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
