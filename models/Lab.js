const mongoose = require("mongoose");

const LabSchema = new mongoose.Schema({
    name: String,
    building: String,
    totalSeats: Number
});

module.exports = mongoose.model("Lab", LabSchema);