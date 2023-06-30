const jwt = require('jsonwebtoken');
const Order = require('../models/order.model');
const { Kafka } = require('kafkajs');
const itemsCache = require("express/lib/application");
const ObjectId = require('mongodb').ObjectId;

const kafka = new Kafka({
    clientId: 'auth-service',
    brokers: ['localhost:9092'],
});
let itemsData = []
const consumer = kafka.consumer({ groupId: 'my-group' ,autoOffsetReset: 'earliest',autoCommitInterval: null});
const producer = kafka.producer();
async function publishOrderData(topic, order) {
    await producer.connect();
    await producer.send({
        topic,
        messages: [{ value: JSON.stringify(order) }],
    });
    await producer.disconnect();
}
async function consumeItems() {
    await consumer.connect();
    await consumer.subscribe({ topic: 'item-created', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const item = JSON.parse(message.value.toString());
            itemsData.push(item)
            console.log(itemsData)
        },
    });
}

    consumeItems();

// Add order
exports.addOrder = async (req, res) => {
    try {
        const { items, totalPrice, quantity } = req.body;

        // Get the user ID from the JWT
        const token = req.headers.authorization;
        const decodedToken = jwt.verify(token, 'maduz');
        const buyerId = decodedToken.id;
        console.log(items)
        async function processOrder() {
            const orderItems = await Promise.all(items.map(async (obj) => {
                const foundItem = await itemsData.find(item => item._id.toString() === obj.item.toString());
                console.log("Fitem:", foundItem);
                if (foundItem) {
                    return { ...foundItem, quantity: obj.quantity };
                } else {
                    return obj;
                }
            }));
            const newOrder = new Order({
                items,
                buyer: buyerId,
                totalPrice,
                quantity
            });
                const manipulatedOrder = {
                    orderItems,
                    buyer: buyerId,
                    totalPrice,
                    quantity
                }
                console.log(newOrder)
             await publishOrderData("order-created",newOrder)
             await newOrder.save();

            res.status(201).json(manipulatedOrder);
        }

       await processOrder();

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove order
exports.removeOrder = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decodedToken = jwt.verify(token, 'maduz');

        const orderId = req.params.orderId;

        await Order.findByIdAndRemove(orderId);

        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Edit order
exports.editOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { items, totalPrice, quantity } = req.body;

        // Get the user ID from the JWT
        const token = req.headers.authorization;
        const decodedToken = jwt.verify(token, 'maduz');
        const buyerId = decodedToken.userId;

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                items,
                buyer: buyerId,
                totalPrice,
                quantity
            },
            { new: true }
        );

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Find order by ID
exports.findOrderById = async (req, res) => {
    try {

        const orderId = req.params.orderId;
        // console.log(itemsCache.get(orderId))

        const order = await Order.findById(orderId);
        console.log("order1",order)
        async function processOrder() {
            const orderItems = await Promise.all(order?.items.map(async (obj) => {
                const foundItem = await itemsData.find(item => item._id.toString() === obj.item.toString());
                console.log("Fitem:", foundItem);
                if (foundItem) {
                    return { ...foundItem, quantity: obj.quantity };
                } else {
                    return obj;
                }
            }));

            const manipulatedOrder = {
                orderItems,
                buyer: order?.buyerId,
                totalPrice: order?.totalPrice,
                quantity: order?.quantity
            }
            console.log(newOrder)

            res.status(200).json(manipulatedOrder);
        }

        processOrder();

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Find orders by buyer ID
exports.findOrderByBuyerId = async (req, res) => {
    try {
        const buyerId = req.params.buyerId;

        const orders = await Order.find({ buyer: buyerId });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all orders with search, sort, and pagination
exports.getAllOrders = async (req, res) => {
    try {
        const { search, sort, page, limit } = req.query;

        // Build the filter object for search
        const filter = {};
        if (search) {
            filter.$or = [
                { items: { $regex: search, $options: 'i' } },
                { totalPrice: { $regex: search, $options: 'i' } },
                { quantity: { $regex: search, $options: 'i' } }
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

        // Query the orders with filter, sort, pagination
        const orders = await Order.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // Get the total count of orders for pagination
        const totalCount = await Order.countDocuments(filter);

        res.status(200).json({
            orders,
            totalCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
