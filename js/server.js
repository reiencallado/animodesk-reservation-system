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

app.use(authRoutes);
app.use(userRoutes);
app.use(reservationRoutes);
app.use(labRoutes);

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
    description: 'A generic man'
  });

  const use2 = await User.create({
    email: 'JaneDoe@dlsu.edu.ph',
    password: '@Hellow0rld',
    role: 'student',
    name: 'Jane Doe',
    studentId: '12345677',
    description: 'A generic woman'
  });

  const use3 = await User.create({
    email: 'Hello@dlsu.edu.ph',
    password: '@Hellow0rld',
    role: 'student',
    name: 'Worlding',
    studentId: '12345679',
    description: 'Hello'
  });

  const use4 = await User.create({
    email: 'Bravado@dlsu.edu.ph',
    password: '@Hellow0rld',
    role: 'student',
    name: 'Bravado',
    studentId: '1259872',
    description: 'A man with great ambitions'
  });

  const use5 = await User.create({
    email: 'Philip@dlsu.edu.ph',
    password: '@Hellow0rld',
    role: 'student',
    name: 'Philippe Marquez',
    studentId: '1238977',
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
    description: 'A generic man'
  });

  const use2 = await User.create({
    email: 'JaneDoe@dlsu.edu.ph',
    password: '@Hellow0rld',
    role: 'student',
    name: 'Jane Doe',
    studentId: '12345677',
    description: 'A generic woman'
  });

  const use3 = await User.create({
    email: 'Hello@dlsu.edu.ph',
    password: '@Hellow0rld',
    role: 'student',
    name: 'Worlding',
    studentId: '12345679',
    description: 'Hello'
  });

  const use4 = await User.create({
    email: 'Bravado@dlsu.edu.ph',
    password: '@Hellow0rld',
    role: 'student',
    name: 'Bravado',
    studentId: '1259872',
    description: 'A man with great ambitions'
  });

  const use5 = await User.create({
    email: 'Philip@dlsu.edu.ph',
    password: '@Hellow0rld',
    role: 'student',
    name: 'Philippe Marquez',
    studentId: '1238977',
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
