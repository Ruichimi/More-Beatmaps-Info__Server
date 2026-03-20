const AppError = require('$/errors/AppError');

function findAppError(err) {
    let current = err;

    while (current) {
        if (current instanceof AppError) {
            return current;
        }
        current = current.cause;
    }

    return null;
}

module.exports = (err, req, res, next) => {
    console.error(err);

    const appError = findAppError(err);

    if (appError) {
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
