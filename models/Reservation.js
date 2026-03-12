const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    labId: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    seats: [Number],
    anonymous: {
        type: Boolean,
        default: false
    },
    reservedFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    createdByTechnician: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["active", "cancelled", "removed"],
        default: "active"
    }
}, { timestamps: true });

module.exports = mongoose.model("Reservation", ReservationSchema);
