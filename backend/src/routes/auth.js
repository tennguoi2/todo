const express = require("express");

const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth'); // if you have one

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes working",
    timestamp: new Date().toISOString(),
  });
});
// Public routes (no auth required)
router.post('/signin', authController.signIn);
router.post('/signup', authController.signUp);
router.post('/google', authController.signInWithGoogle);
router.post('/signout', authController.signOut); // No auth middleware here!

try {
  const {
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  } = require("../controllers/authController");
  const { authenticateToken } = require("../middleware/auth");
// Protected routes (auth required)
// router.get('/profile', authMiddleware, authController.getProfile);

  // Public routes
  router.post("/signin", signIn);
  router.post("/signup", signUp);
  router.post("/google", signInWithGoogle);

  // Protected routes
  router.post("/signout", authenticateToken, signOut);
} catch (error) {
  console.error("Error loading auth controller:", error.message);

  // Fallback routes
  router.post("/signin", (req, res) => {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Authentication service temporarily unavailable",
      },
    });
  });

  router.post("/signup", (req, res) => {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Authentication service temporarily unavailable",
      },
    });
  });
}

module.exports = router;
