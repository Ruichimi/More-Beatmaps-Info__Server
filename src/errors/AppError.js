class AppError extends Error {
    constructor(message, {
        code,
        details = null,
        cause = null,
    } = {}) {
        super(message, { cause });

        this.name = this.constructor.name;
        this.code = code;

        this.code = resolveFromCause(code, cause, 'code', 'UNKNOWN_ERROR');
        this.details = resolveFromCause(details, cause, 'details', null);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

const findErrorInCauseChain = (err, TargetError = AppError) => {
    let current = err;

    while (current) {
        if (current instanceof TargetError) {
            return current;
        }

        current = current?.cause instanceof Error
            ? current.cause
            : null;
    }

    return null;
}

const resolveFromCause = (value, cause, field, fallback = null) => {
    if (value != null) {
        return value;
    }

    if (cause instanceof Error) {
        const parent = findErrorInCauseChain(cause, AppError);
        return parent?.[field] ?? fallback;
    }

    return fallback;
};


module.exports = {
    AppError,
    findErrorInCauseChain,
};
