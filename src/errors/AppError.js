export class AppError extends Error {
    constructor(message, statusCode = 500, code, details) {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = true;
        this.code = code;
        this.details = details;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
