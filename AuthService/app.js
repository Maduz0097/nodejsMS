const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/auth', { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/auth', authRoutes);

app.listen(3001, () => console.log('AuthService listening on port 3001'));
