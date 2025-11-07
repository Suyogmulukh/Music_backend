const express = require("express");
const Booking = require("../models/booking");

const router = express.Router();

// GET booked dates
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find({});
    const dates = bookings.map((b) => b.date);
    res.json(dates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
