const router = require("express").Router();
const reservationController = require("../controllers/reservationController");
const { requireAuth } = require("../middlewares/validation");

router.post("/reserve", requireAuth, reservationController.createReservation);
router.post("/reserve-technician", requireAuth, reservationController.createTechnicianReservation);
router.get("/student-reservations", requireAuth, reservationController.getStudentReservations);
router.delete("/del-student-reservation/:id", requireAuth, reservationController.deleteStudentReservation);
router.get("/reservations", reservationController.getReservations);
router.get("/all-reservations", requireAuth, reservationController.getAllReservations);
router.patch("/reservations/:id", requireAuth, reservationController.updateReservation);
router.delete("/reservations/:id", requireAuth, reservationController.deleteReservation);
router.get("/reservations-with-users", reservationController.getReservationsWithUsers);

module.exports = router;
