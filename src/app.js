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

// Update CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://music-frontend-48drz8s08-suyogs-projects-e7667438.vercel.app",
      "https://music-frontend-48drz8s08-suyogs-projects-e7667438.vercel.app/",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Add preflight handling
app.options("*", cors());

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

// Update error handling to be Vercel-friendly
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  if (err.name === "NotFoundError") {
    return res.status(404).json({
      success: false,
      message: "Resource not found",
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
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
