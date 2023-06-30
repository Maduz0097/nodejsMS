const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0OTAwNDZiNDNkM2NlMTc5MmViYzY1NCIsInJvbGUiOiJzZWxsZXIiLCJpYXQiOjE2ODcxNTk5MzUsImV4cCI6MTY4NzE2MzUzNX0.ZhjTbSJ9lEY3526ja5WZn2wQPefYf1XqZCTJnO5Orog