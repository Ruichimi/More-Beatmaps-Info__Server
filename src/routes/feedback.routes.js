const express = require('express');
const router = express.Router();

const feedbackController = require('$/controllers/feedback.controller');
const requestLimit = require('$/middlewares/rateLimiters');

router.post(
    '/api/feedback',
    requestLimit(10, 60),
    feedbackController.registerFeedback
);

module.exports = router;
