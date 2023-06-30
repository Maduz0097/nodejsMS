const express = require('express');
const router = express.Router();
const {

    addItem,
    removeItem,
    editItem,
    getAllItems,
    getItemByID,
    getItemsBySellerID

} = require('../controllers/item.controller');

router.get('/items', getAllItems);

// Add item route
router.post('/', addItem);

// Remove item route
router.delete('/:itemId', removeItem);

// Edit item route
router.put('/:itemId', editItem);

router.get('/items/:itemId', getItemByID);

// Route for getting items by seller ID
router.get('/items/seller/:sellerId', getItemsBySellerID);

module.exports = router;
