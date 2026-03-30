const router = require("express").Router();
const labController = require("../controllers/labController");
const { requireAuth } = require("../middlewares/validation");

router.get("/labs", labController.getLabs);
router.get("/labs/:id", labController.getLabById);
router.post("/labs", requireAuth, labController.createLab);
router.put("/labs/:id", requireAuth, labController.updateLab);
router.delete("/labs/:id", requireAuth, labController.deleteLab);

module.exports = router;
