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
const handler = async (req, res) => {
  try {
    await initializeDB();
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    return app(req, res);
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server initialization failed",
    });
  }
};

// Export the handler for Vercel
module.exports = handler;
