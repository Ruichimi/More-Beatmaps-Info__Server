const { AppError, findErrorInCauseChain } = require('$/errors/AppError');
const ErrorRegistry = require('$/errors/errorRegistry');

module.exports = (err, req, res, next) => {
    try {
        console.error(err);

        const appError = findErrorInCauseChain(err, AppError);
        const errorData = appError ? ErrorRegistry(appError) : null;

        if (errorData?.isOperational) {
            return sendErrorFromAppError(errorData, res);
        }

        handleUnOperationalError(res);
    } catch (error) {
        console.error('Error handling error:', error);
        handleUnOperationalError(res);
    }
};

const sendErrorFromAppError = (error, res) => {
    return res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
        details: error.details
    });
}

const sendDefaultError = (res) => {
    return res.status(500).json({
        error: 'Internal server error',
        code: null,
        details: null
    });
}

const handleUnOperationalError = (res) => {
    console.error(`An unrecoverable error occurred.`); //We don't have to log the error because of previous code
    sendDefaultError(res);
}
