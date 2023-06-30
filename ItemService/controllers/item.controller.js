const jwt = require('jsonwebtoken');
const Item = require('../models/item.model');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'auth-service',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();
async function publishItemData(topic, item) {
    await producer.connect();
    await producer.send({
        topic,
        messages: [{ value: JSON.stringify(item) }],
    });
    await producer.disconnect();
}
// Add item
exports.addItem = async (req, res) => {
    try {
        const { name, description, price, stockCount } = req.body;

        // Get the user ID from the JWT
        const token = req.headers.authorization;
        console.log(token)
        const decodedToken = jwt.verify(token, 'maduz');

        console.log(decodedToken)
        const sellerId = decodedToken.id;

        const newItem = new Item({
            name,
            description,
            price,
            seller: sellerId,
            stockCount
        });

        const savedItem = await newItem.save();
        console.log(savedItem)
        await publishItemData('item-created', savedItem)
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove item
exports.removeItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        await Item.findByIdAndRemove(itemId);

        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Edit item
exports.editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const { name, description, price, stockCount } = req.body;

        // Get the user ID from the JWT
        const token = req.headers.authorization;
        const decodedToken = jwt.verify(token, 'your_secret_key');
        const sellerId = decodedToken.id;

        const updatedItem = Item.findByIdAndUpdate(
            itemId,
            {
                name,
                description,
                price,
                seller: sellerId,
                stockCount
            },
            { new: true }
        );

        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllItems = async (req, res) => {
    try {
        const { search, sort, page, limit } = req.query;

        // Build the filter object for search
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Build the sort object for sorting
        const sortOptions = {};
        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions[field] = order === 'desc' ? -1 : 1;
        }

        // Calculate the skip value for pagination
        const skip = (page - 1) * limit;

        // Query the items with filter, sort, pagination
        const items = await Item.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // Get the total count of items for pagination
        const totalCount = await Item.countDocuments(filter);

        res.status(200).json({
            items,
            totalCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getItemByID = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get items by seller ID
exports.getItemsBySellerID = async (req, res) => {
    try {
        const sellerId = req.params.sellerId;

        const items = await Item.find({ seller: sellerId });

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};