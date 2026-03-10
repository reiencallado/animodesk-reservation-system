const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    labId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lab"
    },
    date: String,
    timeSlot: String,
    seats: [Number],
    anonymous: Boolean,
    reservedFor: String
}, { timestamps: true });

module.exports = mongoose.model("Reservation", ReservationSchema);