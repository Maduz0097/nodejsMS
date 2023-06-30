const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [
        {
            item:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item',
                required: true
            },
        quantity:{
            type: Number,
            required: true
        }


        }
    ],
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
