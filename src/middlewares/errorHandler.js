const { AppError, findErrorInCauseChain } = require('$/errors/AppError');
const ErrorRegistry = require('$/errors/errorRegistry');

module.exports = (err, req, res, next) => {
    try {
        console.log(err);
        if (err instanceof AppError) {
            return sendErrorFromAppError(err, res);
        } else {
            const foundAppError = findErrorInCauseChain(err, AppError);
            if (foundAppError) {
                return sendErrorFromAppError(foundAppError, res);
            }
        }

        sendDefaultError(res);
    } catch (error) {
        console.error('Error handling error:', error);
        sendDefaultError(res);
    }
};

const sendErrorFromAppError = (err, res) => {
    const ErrorHttpResponse = ErrorRegistry(err);

    if (ErrorHttpResponse) {
        return res.status(ErrorHttpResponse.statusCode).json({
            error: ErrorHttpResponse.message,
            code: ErrorHttpResponse.code,
            details: ErrorHttpResponse.details
        });
    }
}

const sendDefaultError = (res) => {
    return res.status(500).json({
        error: 'Internal server error',
        code: null,
        details: null
    });
}
