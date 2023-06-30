const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// Add order
router.post('/orders', orderController.addOrder);

// Remove order
router.delete('/orders/:orderId', orderController.removeOrder);

// Edit order
router.put('/orders/:orderId', orderController.editOrder);

// Find order by ID
router.get('/orders/:orderId', orderController.findOrderById);

// Find orders by buyer ID
router.get('/orders/buyer/:buyerId', orderController.findOrderByBuyerId);

// Get all orders with search, sort, and pagination
router.get('/orders', orderController.getAllOrders);

module.exports = router;
