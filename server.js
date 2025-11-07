require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");
const PORT = process.env.PORT || 3000;

// Initialize server only after DB connection
const startServer = async () => {
  try {
    await connectDB(); // Wait for DB connection
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  if (process.env.NODE_ENV === "development") {
    process.exit(1);
  }
});

module.exports = app;
