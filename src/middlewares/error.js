const AppError = require('$/errors/AppError');

module.exports = (err, req, res, next) => {
    console.error(err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
            details: err.details
        });
    }

    res.status(500).json({
        error: 'Internal server error'
    });
};
