const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

// ✅ All lowercase directory paths
const calendarRoutes = require("./routes/calendar.routes");
const inquiryRoutes = require("./routes/inquiry.routes");
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();

// ✅ Allow production frontend domains
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

// ✅ API routes
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

module.exports = app;
