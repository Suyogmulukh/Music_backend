// create server
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const calendarRoutes = require("./routes/calendar.routes");
const inquiryRoutes = require("./Routes/inquiry.routes");
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");
const cors = require("cors");

const app = express();

// Update CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL || "https://your-vercel-frontend-url.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

// Add request timeout middleware (add after other app.use but before routes)
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    res.status(408).json({ success: false, message: "Request timeout" });
  });
  next();
});

// Add health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Add root health check (add before other routes)
app.get("/", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

// Update error handling middleware
app.use((err, req, res, next) => {
  console.error("Error details:", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Handle mongoose errors
  if (err.name === "MongooseError" || err.name === "MongoServerError") {
    return res.status(503).json({
      success: false,
      message: "Database service unavailable",
    });
  }

  // Handle MongoDB connection errors
  if (err.name === "MongooseServerSelectionError") {
    return res.status(503).json({
      success: false,
      message: "Database connection error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

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
