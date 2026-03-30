const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const User = require("../models/User");
const Lab = require("../models/Lab");
const Reservation = require("../models/Reservation");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const labRoutes = require("./routes/labRoutes");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        sameSite: 'lax'
    }
}));
app.use(express.static(path.join(__dirname, "..")));
mongoose.connect("mongodb://localhost:27017/animodesk")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
app.use(authRoutes);
app.use(userRoutes);
app.use(reservationRoutes);
app.use(labRoutes);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});
app.get('/seed', async (req, res) => {
    try {
        const sampleUsers = [
            {
                email: 'JohnDoe@dlsu.edu.ph',
                password: '@Hellow0rld',
                role: 'student',
                name: 'John Doe',
                studentId: '12345678',
                profilePic: '/images/defaultpfp.jpg',
                description: 'A generic man'
            },
            {
                email: 'JaneDoe@dlsu.edu.ph',
                password: '@Hellow0rld',
                role: 'student',
                name: 'Jane Doe',
                studentId: '12345677',
                profilePic: '/images/defaultpfp.jpg',
                description: 'A generic woman'
            },
            {
                email: 'Hello@dlsu.edu.ph',
                password: '@Hellow0rld',
                role: 'student',
                name: 'Worlding',
                studentId: '12345679',
                profilePic: '/images/defaultpfp.jpg',
                description: 'Hello'
            },
            {
                email: 'Bravado@dlsu.edu.ph',
                password: '@Hellow0rld',
                role: 'student',
                name: 'Bravado',
                studentId: '1259872',
                profilePic: '/images/defaultpfp.jpg',
                description: 'A man with great ambitions'
            },
            {
                email: 'Philip@dlsu.edu.ph',
                password: '@Hellow0rld',
                role: 'student',
                name: 'Philippe Marquez',
                studentId: '1238977',
                profilePic: '/images/defaultpfp.jpg',
                description: 'An ambitious and talented learner'
            }
        ];

        const ofllabs = [
            { name: 'GK301', building: 'Gokongwei', totalSeats: 40 },
            { name: 'SJ204', building: 'St. Joseph', totalSeats: 40 },
            { name: 'AG1502', building: 'Andrew', totalSeats: 40}
        ];

        const existingLabs = await Lab.find();
        if (existingLabs.length === 0) {
            await Lab.create(ofllabs);
        }

        const existingUsers = await User.find({ email: { $in: sampleUsers.map(u => u.email) } });
        const existingEmails = new Set(existingUsers.map((u) => u.email));
        const usersToCreate = sampleUsers.filter((user) => !existingEmails.has(user.email));
        if (usersToCreate.length > 0) {
            await User.create(usersToCreate);
        }

        const allUsers = await User.find({ email: { $in: sampleUsers.map(u => u.email) } });
        const labs = await Lab.find();

        const reservationCount = await Reservation.countDocuments();
        const sampleReservationData = [
            { user: allUsers[0], lab: labs[0], date: '2026-03-30', timeSlot: '07:30 - 08:00', seats: [5, 3, 2] },
            { user: allUsers[1], lab: labs[0], date: '2026-03-30', timeSlot: '08:00 - 08:30', seats: [8] },
            { user: allUsers[2], lab: labs[1] || labs[0], date: '2026-03-31', timeSlot: '09:00 - 09:30', seats: [13] },
            { user: allUsers[3], lab: labs[1] || labs[0], date: '2026-03-31', timeSlot: '10:00 - 10:30', seats: [4, 6] },
            { user: allUsers[4], lab: labs[1] || labs[0], date: '2026-03-31', timeSlot: '11:00 - 11:30', seats: [12, 14] }
        ];

        if (reservationCount < 5) {
            const reservationsToCreate = sampleReservationData.slice(reservationCount).map((item) => ({
                userId: item.user._id,
                labId: item.lab._id.toString(),
                date: item.date,
                timeSlot: item.timeSlot,
                seats: item.seats,
                anonymous: false,
                reservedFor: item.user._id,
                createdByTechnician: false,
                status: 'active'
            }));
            await Reservation.create(reservationsToCreate);
        }

        res.send('Seed complete. Existing labs are preserved and sample data is ensured.');
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).send('Seed failed.');
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
