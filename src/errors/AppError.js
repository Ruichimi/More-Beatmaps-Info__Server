class AppError extends Error {
    constructor(message, statusCode = 500, code = 'UNKNOWN_ERROR', details = null, cause = null) {
        super(message, { cause });

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

const findAppErrorInCauseChain = (err) => {
    let current = err;

    while (current) {
        if (current instanceof AppError) {
            return current;
        }
        current = current.cause;
    }

    return null;
}

const validationError = (msg = 'Validation error') =>
    new AppError(msg, 400, 'VALIDATION_ERROR');

const notFound = (msg = 'Not found') =>
    new AppError(msg, 404, 'NOT_FOUND');

const userNotFound = () =>
    new AppError('User not found', 404, 'USER_NOT_FOUND');

const invalidToken = () =>
    new AppError('Invalid token', 401, 'INVALID_TOKEN');

module.exports = {
    AppError,

    findAppErrorInCauseChain: findAppErrorInCauseChain,

    validationError,
    notFound,
    userNotFound,
    invalidToken,
};
