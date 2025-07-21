const express = require("express");
const router = express.Router();

// Test route (no auth required)
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Task routes working",
    timestamp: new Date().toISOString(),
  });
});

try {
  const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    getTaskStatistics,
  } = require("../controllers/taskController");
  const { authenticateToken } = require("../middleware/auth");

  // All task routes require authentication
  router.use(authenticateToken);

  router.get("/", getTasks);
  router.post("/", createTask);
  router.get("/statistics", getTaskStatistics);
  router.put("/:id", updateTask);
  router.delete("/:id", deleteTask);
  router.post("/:id/complete", toggleTaskComplete);
  router.get("/:id", getTasks); // Get specific task
} catch (error) {
  console.error("Error loading task controller:", error.message);

  // Fallback route
  router.get("/", (req, res) => {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Task service temporarily unavailable",
      },
    });
  });
}

module.exports = router;
