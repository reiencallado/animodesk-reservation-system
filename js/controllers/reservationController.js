const Reservation = require("../../models/Reservation");
const User = require("../../models/User");

/**
 * Helper function to send standardized error responses in reservation controller.
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 */
const sendError = (res, status, message) => res.status(status).json({ success: false, message });


/**
 * Creates a new reservation for the authenticated student user.
 * Parses seats from comma-separated string, sets anonymous flag from checkbox.
 * @param {Object} req - Express request with session.userId and body {labId, date, timeSlot, seats, anonymous}
 * @param {Object} res - Express response
 * @returns Redirect to student.html or error
 */
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
       res.redirect("/student.html")
    } catch (error) {
        console.error("Error saving reservation:", error);
        sendError(res, 500, "Reservation failed.");
    }
};

/**
 * Creates reservation on behalf of student by technician.
 * Requires studentId, sets createdByTechnician flag.
 * @param {Object} req - Express request with body {labId, date, timeSlot, seats, studentId}
 * @param {Object} res - Express response
 * @returns Redirect to technician.html or error
 */
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
        res.redirect("/technician.html")
    } catch (error) {
        console.error("Error saving technician reservation:", error);
        sendError(res, 500, "Reservation failed.");
    }
};

/**
 * Retrieves reservations for the authenticated student, sorted by date.
 * @param {Object} req - Express request with session.userId
 * @param {Object} res - Express response
 * @returns {JSON} Array of user's reservations or error
 */
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


/**
 * Allows authenticated student to delete their own reservation (ownership check).
 * @param {Object} req - Express request with session.userId and params.id
 * @param {Object} res - Express response
 * @returns {JSON} Success message or auth/error
 */
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


/**
 * Gets reservations for specific lab/date/timeSlot (for seat availability map).
 * @param {Object} req - Express request with query labId, date, timeSlot
 * @param {Object} res - Express response
 * @returns {JSON} Array of matching reservations or error
 */
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


/**
 * Gets all reservations sorted by date/timeSlot, enriches with student names (looks up User).
 * @param {Object} req - Express request (auth required?)
 * @param {Object} res - Express response
 * @returns {JSON} Enriched reservations array or error
 */
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


/**
 * Updates existing reservation by ID (lab, date, slots, anonymous).
 * Runs validators.
 * @param {Object} req - Express request with params.id and body updates
 * @param {Object} res - Express response
 * @returns {JSON} Updated reservation or error
 */
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


/**
 * Deletes a reservation by ID (admin/technician use? no ownership check).
 * @param {Object} req - Express request with params.id
 * @param {Object} res - Express response
 * @returns {JSON} Success or 404/500 error
 */
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


/**
 * Gets reservations for specific lab/date/timeSlot, enriches non-anonymous with student name/ID.
 * @param {Object} req - Express request with query labId, date, timeSlot
 * @param {Object} res - Express response
 * @returns {JSON} Enriched reservations or error
 */
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

