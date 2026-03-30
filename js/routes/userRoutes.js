const router = require("express").Router();
const userController = require("../controllers/userController");
const { requireAuth } = require("../middlewares/validation");

router.get("/users", userController.getUsers);
router.get("/users/students", userController.getStudents);
router.get("/users/all", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.get("/profile", requireAuth, userController.getProfile);
router.put("/profile", requireAuth, userController.updateProfile);
router.delete("/user", requireAuth, userController.deleteAccount);

module.exports = router;
