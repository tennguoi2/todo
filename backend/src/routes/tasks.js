const express = require("express");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  getTaskStatistics,
} = require("../controllers/taskController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All task routes require authentication
router.use(authenticateToken);

router.get("/", getTasks);
router.post("/", createTask);
router.get("/statistics", getTaskStatistics);
router.get("/:id", getTasks); // Get specific task (handled by getTasks with ID filter)
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/complete", toggleTaskComplete);

module.exports = router;
