const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: String,
  phone: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ["Haldi", "Varat", "Haldi & Varat", "Birthday", "Other"],
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  advancePayment: {
    type: Number,
    required: true,
  },
  remainingPayment: {
    type: Number,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
