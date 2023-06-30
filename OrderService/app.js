const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/order.routes');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/order', { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/', authRoutes);

app.listen(3003, () => console.log('ItemService listening on port 3003'));
