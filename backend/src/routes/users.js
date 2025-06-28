const express = require("express");
const { User } = require("../models");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Get current user profile
router.get("/profile", async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.user.toJSON(),
      message: "User profile retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put("/profile", async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = req.user;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    await user.update(updates);

    res.json({
      success: true,
      data: user.toJSON(),
      message: "User profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
