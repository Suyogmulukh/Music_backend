// create server
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
// changed imports to match directory casing on disk (Routes vs routes)
const calendarRoutes = require("./routes/calendar.routes");
const inquiryRoutes = require("./Routes/inquiry.routes");
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");
const cors = require("cors");

const app = express();

// Update CORS to accept Vercel frontend URL
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-vercel-frontend-url.vercel.app",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

// Add health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

// Update error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Handle specific errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      error: err.message,
    });
  }

  if (err.name === "MongoError" || err.name === "MongooseError") {
    return res.status(503).json({
      success: false,
      message: "Database Error",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Service Temporarily Unavailable",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
