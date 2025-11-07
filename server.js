require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");

// Initialize database connection
let cachedDB = null;

async function initializeDB() {
  if (cachedDB) {
    return cachedDB;
  }
  try {
    cachedDB = await connectDB();
    return cachedDB;
  } catch (error) {
    console.error("Database connection failed:", error);
    return null;
  }
}

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  initializeDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
}

// For Vercel serverless functions
module.exports = async (req, res) => {
  try {
    await initializeDB();
    return app(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server initialization failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal Server Error",
    });
  }
};
