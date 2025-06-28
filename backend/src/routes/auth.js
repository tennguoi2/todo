const express = require("express");
const {
  signIn,
  signUp,
  signInWithGoogle,
  signOut,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/signin", signIn);
router.post("/signup", signUp);
router.post("/google", signInWithGoogle);

// Protected routes
router.post("/signout", authenticateToken, signOut);

module.exports = router;
