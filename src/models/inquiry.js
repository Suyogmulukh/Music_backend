const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    eventType: String,
    location: String,
    guests: Number,
    message: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("inquiry", inquirySchema);
