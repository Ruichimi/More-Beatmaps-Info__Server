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

module.exports = AppError;
