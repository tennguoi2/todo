const express = require("express");
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectTasks,
} = require("../controllers/projectController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All project routes require authentication
router.use(authenticateToken);

router.get("/", getProjects);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.get("/:id/tasks", getProjectTasks);

module.exports = router;
