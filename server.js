require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");

connectDB();

// Export the app for Vercel serverless deployment
module.exports = app;
