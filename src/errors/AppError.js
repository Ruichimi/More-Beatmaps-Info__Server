class AppError extends Error {
    constructor(message, {
        code,
        details = null,
        cause = null,
    } = {}) {
        super(message, { cause });

        this.name = this.constructor.name;

        this.code = resolveFromCause(code, cause, 'code', 'UNKNOWN_ERROR');
        this.details = resolveFromCause(details, cause, 'details', null);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    static match(error) {
        return new AppErrorMatcher(error);
    }
}

class AppErrorMatcher {
    constructor(error) {
        this.error = error;
        this.result = null;
    }

    case(parentCode, message, options = {}) {
        if (!this.result && this.error instanceof AppError && this.error.code === parentCode) {

            this.result = new AppError(message, {
                ...options,
                cause: this.error,
            });
        }

        return this;
    }

    or(fallbackMessage, fallbackOptions = {}) {
        if (this.result) return this.result;

        return new AppError(fallbackMessage, {
            ...fallbackOptions,
            cause: this.error,
        });
    }

    /**
     * If some case matched, returns the matched error.
     * If no case matched, returns the original error.
     */
    resolve() {
        return this.result ?? this.error;
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
