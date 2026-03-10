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

    const { labId, date, timeSlot, seats, anonymous } = req.body;

    const seatNumbers = seats.split(",").map(Number);

    const reservation = new Reservation({
      labId,
      date,
      timeSlot,
      seats: seatNumbers,
      anonymous: anonymous === "on"
    });

    await reservation.save();

    console.log("Reservation saved:", reservation);

    res.redirect("/student.html");

  } catch (error) {
    console.error("Error saving reservation:", error);
    res.send("Reservation failed.");
  }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});