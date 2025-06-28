require("dotenv").config();
const app = require("./src/app");
const sequelize = require("./src/config/database");

const PORT = process.env.PORT || 3000;

// Test database connection and sync models
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync database models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log("Database models synchronized.");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
