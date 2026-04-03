const feedbackService = require('$/services/feedback.service');

exports.registerFeedback = async (req, res, next) => {
    try {
        await feedbackService.create({
            email: req.body.email,
            type: req.body.type,
            message: req.body.message
        });

        res.status(200).json({ message: 'Your feedback sent successfully!' });
    } catch (error) {
        next(error);
    }
}
