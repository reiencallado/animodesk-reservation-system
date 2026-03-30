const Reservation = require("../models/Reservation");
const User = require("../models/User");

const sendError = (res, status, message) => res.status(status).json({ success: false, message });

exports.createReservation = async (req, res) => {
    try {
        const { labId, date, timeSlot, seats, anonymous } = req.body;
        const seatNumbers = typeof seats === "string" ? seats.split(",").map(Number) : [];
        const userId = req.session.userId;

        if (!labId || !date || !timeSlot || seatNumbers.length === 0) {
            return sendError(res, 400, "Lab ID, date, time slot, and seats are required.");
        }

        const reservation = new Reservation({
            userId,
            labId,
            date,
            timeSlot,
            seats: seatNumbers,
            anonymous: anonymous === "on",
            status: "active"
        });

        await reservation.save();
        res.json({ success: true, reservation });
    } catch (error) {
        console.error("Error saving reservation:", error);
        sendError(res, 500, "Reservation failed.");
    }
};

exports.createTechnicianReservation = async (req, res) => {
    try {
        const { labId, date, timeSlot, seats, studentId } = req.body;
        const seatNumbers = typeof seats === "string" ? seats.split(",").map(Number) : [];

        if (!labId || !date || !timeSlot || seatNumbers.length === 0 || !studentId) {
            return sendError(res, 400, "All reservation fields are required.");
        }

        const reservation = new Reservation({
            labId,
            date,
            timeSlot,
            seats: seatNumbers,
            anonymous: false,
            createdByTechnician: true,
            userId: studentId,
            reservedFor: studentId,
            status: "active"
        });

        await reservation.save();
        res.json({ success: true, reservation });
    } catch (error) {
        console.error("Error saving technician reservation:", error);
        sendError(res, 500, "Reservation failed.");
    }
};

exports.getStudentReservations = async (req, res) => {
    try {
        const userId = req.session.userId;
        const reservations = await Reservation.find({ userId }).sort({ date: 1 });
        res.json(reservations);
    } catch (error) {
        console.error(error);
        sendError(res, 500, "Error getting reservations.");
    }
};

exports.deleteStudentReservation = async (req, res) => {
    try {
        const userId = req.session.userId;
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return sendError(res, 404, "Reservation not found.");
        }

        if (String(reservation.userId) !== String(userId)) {
            return sendError(res, 403, "You are not authorized to delete this reservation.");
        }

        await Reservation.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Reservation cancelled." });
    } catch (error) {
        console.error(error);
        sendError(res, 500, "Error cancelling reservation");
    }
};

exports.getReservations = async (req, res) => {
    try {
        const { labId, date, timeSlot } = req.query;
        const reservations = await Reservation.find({ labId, date, timeSlot });
        res.json(reservations);
    } catch (error) {
        console.error(error);
        sendError(res, 500, "Error loading reservations");
    }
};

exports.getAllReservations = async (req, res) => {
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
        sendError(res, 500, "Error loading reservations");
    }
};

exports.updateReservation = async (req, res) => {
    try {
        const { labId, date, timeSlot, seats, anonymous } = req.body;
        const updated = await Reservation.findByIdAndUpdate(
            req.params.id,
            { labId, date, timeSlot, seats, anonymous },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return sendError(res, 404, "Reservation not found.");
        }
        res.json({ success: true, reservation: updated });
    } catch (error) {
        console.error(error);
        sendError(res, 500, "Error updating reservation.");
    }
};

exports.deleteReservation = async (req, res) => {
    try {
        const deleted = await Reservation.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return sendError(res, 404, "Reservation not found.");
        }
        res.json({ success: true, message: "Reservation deleted." });
    } catch (error) {
        console.error(error);
        sendError(res, 500, "Error deleting reservation.");
    }
};

exports.getReservationsWithUsers = async (req, res) => {
    try {
        const { labId, date, timeSlot } = req.query;
        const reservations = await Reservation.find({ labId, date, timeSlot });
        const enriched = await Promise.all(reservations.map(async (r) => {
            const obj = r.toObject();
            if (!r.anonymous) {
                const lookupId = r.userId || r.reservedFor;
                if (lookupId) {
                    const user = await User.findById(lookupId).select("name _id");
                    obj.reserveeName = user ? user.name : null;
                    obj.reserveeId = user ? user._id : null;
                }
            }
            return obj;
        }));
        res.json(enriched);
    } catch (error) {
        console.error(error);
        sendError(res, 500, "Error loading reservations");
    }
};
