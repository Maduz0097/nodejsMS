const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'auth-service',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();
async function publishUserData(topic, user) {
    await producer.connect();
    await producer.send({
        topic,
        messages: [{ value: JSON.stringify(user) }],
    });
    await producer.disconnect();
}
const register = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        await publishUserData('user-created', user);
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
};

const login = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).send({ message: 'Invalid username or password' });

        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) return res.status(400).send({ message: 'Invalid username or password' });

        const token = jwt.sign({ id: user._id, role: user.role }, 'maduz', { expiresIn: '1d' });
        res.status(200).send({ token, user });
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports = {
    register,
    login
};
