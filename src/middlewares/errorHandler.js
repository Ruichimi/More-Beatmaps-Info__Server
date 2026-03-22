const { findAppErrorInCauseChain } = require('$/errors/AppError');

module.exports = (err, req, res, next) => {
    console.error(err);

    const appError = findAppErrorInCauseChain(err);

    if (appError && appError.statusCode) {
        return res.status(appError.statusCode).json({
            error: appError.message,
            code: appError.code,
            details: appError.details
        });
    }

    res.status(500).json({
        error: 'Internal server error'
    });
};
