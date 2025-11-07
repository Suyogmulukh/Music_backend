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

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

module.exports = app;
