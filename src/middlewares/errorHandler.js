const { AppError, findErrorInCauseChain } = require('$/errors/AppError');
const ERROR_CODES = require('$/errors/errorCodes');
const processError = require('$/errors/errorHandler');
const logError = require('$/utils/logging/errorLogger');

module.exports = (err, req, res, next) => {
    try {
        console.error(err);

        const appError = findErrorInCauseChain(err, AppError);
        const errorData = appError ? processError(appError) : null;

        if (errorData.isOperational) {
            return sendErrorClient(errorData, res);
        }

        handleUnOperationalError(err, res);
    } catch (error) {
        console.error('Error handling error:', error);
        handleUnOperationalError(error, res);
    }
};

const sendErrorClient = (error, res) => {
    return res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
        details: error.details
    });
}

const sendDefaultError = (res) => {
    const defaultError = ERROR_CODES.DEFAULT_ERROR;

    return res.status(defaultError.statusCode).json({
        error: defaultError.message,
        code: defaultError.code,
        details: defaultError.details
    });
}

const handleUnOperationalError = (error, res) => {
    console.error(`An unrecoverable error occurred.`); //We don't have to log the error in console because of previous code
    logError(error);
    sendDefaultError(res);
}
