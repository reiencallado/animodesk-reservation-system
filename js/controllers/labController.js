const Lab = require("../../models/Lab");

/**
 * Controller module for Lab model CRUD operations.
 * Exports functions for Express routes.
 */


/**
 * Helper function to send standardized error responses in lab controller.
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 */
const sendError = (res, status, message) => res.status(status).json({ success: false, message });


/**
 * Retrieves all labs from the database.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Array of lab objects or error
 */
exports.getLabs = async (req, res) => {
    try {
        const labs = await Lab.find();
        res.json(labs);
    } catch (error) {
        console.error("Error fetching labs:", error);
        sendError(res, 500, "Error fetching labs.");
    }
};


/**
 * Retrieves a single lab by its MongoDB ID.
 * @param {Object} req - Express request with params.id
 * @param {Object} res - Express response
 * @returns {JSON} Lab object or 404/500 error
 */
exports.getLabById = async (req, res) => {
    try {
        const lab = await Lab.findById(req.params.id);
        if (!lab) {
            return sendError(res, 404, "Lab not found.");
        }
        res.json(lab);
    } catch (error) {
        console.error("Error fetching lab:", error);
        sendError(res, 500, "Error fetching lab.");
    }
};


/**
 * Creates a new lab in the database.
 * Validates required fields before saving.
 * @param {Object} req - Express request with body {name, building, totalSeats}
 * @param {Object} res - Express response
 * @returns {JSON} Created lab (201) or validation/server error
 */
exports.createLab = async (req, res) => {
    try {
        const { name, building, totalSeats } = req.body;
        if (!name || !building || typeof totalSeats === "undefined") {
            return sendError(res, 400, "Name, building, and total seats are required.");
        }

        const lab = new Lab({ name, building, totalSeats });
        await lab.save();
        res.status(201).json({ success: true, lab });
    } catch (error) {
        console.error("Error creating lab:", error);
        sendError(res, 500, "Error creating lab.");
    }
};


/**
 * Updates an existing lab by ID with new name, building, or totalSeats.
 * Runs validators and returns updated document.
 * @param {Object} req - Express request with params.id and body {name?, building?, totalSeats?}
 * @param {Object} res - Express response
 * @returns {JSON} Updated lab or 404/500 error
 */
exports.updateLab = async (req, res) => {
    try {
        const { name, building, totalSeats } = req.body;
        const updated = await Lab.findByIdAndUpdate(
            req.params.id,
            { name, building, totalSeats },
            { new: true, runValidators: true }
        );
        if (!updated) {
            return sendError(res, 404, "Lab not found.");
        }
        res.json({ success: true, lab: updated });
    } catch (error) {
        console.error("Error updating lab:", error);
        sendError(res, 500, "Error updating lab.");
    }
};


/**
 * Deletes a lab by its MongoDB ID.
 * @param {Object} req - Express request with params.id
 * @param {Object} res - Express response
 * @returns {JSON} Success message or 404/500 error
 */
exports.deleteLab = async (req, res) => {
    try {
        const deleted = await Lab.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return sendError(res, 404, "Lab not found.");
        }
        res.json({ success: true, message: "Lab deleted." });
    } catch (error) {
        console.error("Error deleting lab:", error);
        sendError(res, 500, "Error deleting lab.");
    }
};

