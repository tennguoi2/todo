const express = require("express");
const {
  getFocusSessions,
  createFocusSession,
  completeFocusSession,
  getFocusStatistics,
  getFocusSettings,
  updateFocusSettings,
} = require("../controllers/focusController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All focus routes require authentication
router.use(authenticateToken);

router.get("/sessions", getFocusSessions);
router.post("/sessions", createFocusSession);
router.put("/sessions/:id/complete", completeFocusSession);
router.get("/statistics", getFocusStatistics);
router.get("/settings", getFocusSettings);
router.put("/settings", updateFocusSettings);

module.exports = router;
