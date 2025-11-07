const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.Middleware');
const orderController = require('../controller/order.controller');

router.post('/', auth, orderController.createOrder);
router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrder);
router.put('/:id', auth, orderController.updateOrder);
router.delete('/:id', auth, orderController.deleteOrder);
router.get('/:id/download', auth, orderController.downloadInvoice);
router.get("/download/all",auth, orderController.downloadAllOrders);

module.exports = router;
