require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");

// Track connection status to avoid reconnecting every function call
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  await connectDB();
  isConnected = true;
  console.log("MongoDB ready for serverless execution");
};

// 🔹 Vercel serverless handler
module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    return app(req, res); // Express handles the request
  } catch (error) {
    console.error("❌ Serverless function error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 🔹 Optional local dev mode (run `node server.js` locally)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  connectToDatabase().then(() => {
    app.listen(PORT, () => console.log(`🚀 Dev server running on port ${PORT}`));
  });
}
