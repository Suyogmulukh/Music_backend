require("dotenv").config();
const express = require("express");
const app = require("./src/app");
const connectDB = require("./src/db/db");

let isConnected = false;
const handler = express();

// Initialize express middleware
handler.use(express.json());
handler.use(express.urlencoded({ extended: true }));

// Mount the main app
handler.use(app);

// Error handling middleware
handler.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

module.exports = async (req, res) => {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }
    handler(req, res);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
