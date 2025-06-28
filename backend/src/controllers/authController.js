const jwt = require("jsonwebtoken");
const {
  User,
  FocusSettings,
  NotificationSettings,
  ThemeSettings,
} = require("../models");

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "your_super_secret_jwt_key_here",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
};

const createDefaultSettings = async (userId) => {
  try {
    await Promise.all([
      FocusSettings.create({ user_id: userId }),
      NotificationSettings.create({ user_id: userId }),
      ThemeSettings.create({ user_id: userId }),
    ]);
  } catch (error) {
    console.error("Error creating default settings:", error);
  }
};

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Email and password are required",
        },
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
      message: "Sign in successful",
    });
  } catch (error) {
    next(error);
  }
};

const signUp = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Email, password, and name are required",
        },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: "WEAK_PASSWORD",
          message: "Password must be at least 6 characters long",
        },
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: "USER_EXISTS",
          message: "User with this email already exists",
        },
      });
    }

    const user = await User.create({
      email,
      password_hash: password,
      name,
    });

    // Create default settings for the new user
    await createDefaultSettings(user.id);

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
      message: "Account created successfully",
    });
  } catch (error) {
    next(error);
  }
};

const signInWithGoogle = async (req, res, next) => {
  try {
    const { googleId, email, name, avatar, idToken } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Google ID, email, and name are required",
        },
      });
    }

    // Check if user exists by Google ID or email
    let user = await User.findOne({
      where: {
        $or: [{ google_id: googleId }, { email }],
      },
    });

    if (user) {
      // Update Google ID if not set
      if (!user.google_id) {
        user.google_id = googleId;
        user.avatar = avatar;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email,
        name,
        google_id: googleId,
        avatar,
      });

      // Create default settings for the new user
      await createDefaultSettings(user.id);
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
      message: "Google sign in successful",
    });
  } catch (error) {
    next(error);
  }
};

const signOut = async (req, res, next) => {
  try {
    // In a more sophisticated implementation, you might want to blacklist the token
    res.json({
      success: true,
      message: "Sign out successful",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signIn,
  signUp,
  signInWithGoogle,
  signOut,
};
