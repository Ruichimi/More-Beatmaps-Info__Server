const express = require('express');
const router = express.Router();

const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const users = require('$/models/users');

const requestLimit = require('$/middlewares/rateLimiters');

router.post('/api/token', requestLimit(7, 60), (req, res, next) => {
    try {
        const user = { id: uuidv4() };
        const token = jwt.sign(user, process.env.APP_KEY, { expiresIn: '100h' });
        users.addActiveUser(user, req.ip);
        res.json({ token });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
