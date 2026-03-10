const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");
const Lab = require("../models/Lab");
const Reservation = require("../models/Reservation");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/animodesk")
.then(() => {
    console.log("MongoDB connected");
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.post("/reserve", async (req, res) => {
    try {

        const reservation = new Reservation({
            userId: req.body.userId,
            labId: req.body.labId,
            date: req.body.date,
            timeSlot: req.body.timeSlot,
            seats: req.body.seats,
            anonymous: req.body.anonymous
        });

        await reservation.save();

        res.send("Reservation successful!");

    } catch (error) {
        console.error(error);
        res.status(500).send("Reservation failed.");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});