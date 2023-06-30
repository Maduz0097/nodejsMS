const mongoose = require('mongoose');


const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stockCount: {
        type: Number,
        required: true,
        default: 0
    }
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
