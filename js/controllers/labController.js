const Lab = require("../models/Lab");

const sendError = (res, status, message) => res.status(status).json({ success: false, message });

exports.getLabs = async (req, res) => {
    try {
        const labs = await Lab.find();
        res.json(labs);
    } catch (error) {
        console.error("Error fetching labs:", error);
        sendError(res, 500, "Error fetching labs.");
    }
};

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
