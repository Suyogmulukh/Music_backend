const express = require("express");
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  downloadInvoice,
  downloadAllOrders,
} = require("../controller/order.controller");

router.get("/", getOrders);
router.get("/:id", getOrder);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.get("/:id/invoice", downloadInvoice);
router.get("/download/all", downloadAllOrders);

module.exports = router;
