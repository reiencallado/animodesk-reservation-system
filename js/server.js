const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");
const Lab = require("../models/Lab");

const app = express();
const PORT = 3000;

mongoose.connect("mongodb://localhost:27017/animodesk")
.then(() => {
    console.log("MongoDB connected");


 // SAMPLE DATA //   
    // const testUser = new User({
    //     email: "test@dlsu.edu.ph",
    //     password: "123456",
    //     role: "student",
    //     name: "Test User",
    //     profilePic: "",
    //     description: "Test account"
    // });

    // await testUser.save();
    // console.log("Test user created");

    // const labs = [
    //     {
    //         name: "GK301",
    //         building: "Gokongwei Hall",
    //         totalSeats: 40
    //     },
    //     {
    //         name: "SJ204",
    //         building: "St. Joseph Hall",
    //         totalSeats: 40
    //     },
    //     {
    //         name: "AG1502",
    //         building: "Andrew Gonzalez Hall",
    //         totalSeats: 40
    //     }
    // ];

    // await Lab.insertMany(labs);
    // console.log("Labs inserted");

})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});