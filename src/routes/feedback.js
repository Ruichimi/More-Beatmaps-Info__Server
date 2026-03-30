const express = require('express');
const router = express.Router();

const Feedback = require('../services/FeedbackService');
const requestLimit = require('../middlewares/rateLimiters');

router.post('/api/feedback', requestLimit(10, 60), async (req, res, next) => {
    try {
        await Feedback.create({
            email: req.body.email,
            type: req.body.type,
            message: req.body.message
        });

        res.status(200).json({ message: 'Feedback sent successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
