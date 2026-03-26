const errorScenarios = require('$/errors/errorScenarios');
const ERROR_CODES = require('$/errors/errorCodes');

const ErrorRegistry = (error) => {
    const errorCode = error?.code;

    if (errorCode && typeof errorScenarios[errorCode] === 'function') {
        const scenarioResult = errorFromScenarios(error);

        if (scenarioResult && scenarioResult.message) {
            return scenarioResult;
        }
    }

    if (errorCode && ERROR_CODES[errorCode]) {
        return errorFromCodes(errorCode);
    }

    return normalizeError(ERROR_CODES.UNKNOWN_ERROR);
};

const errorFromScenarios = (error) => {
    if (!error.code) {
        throw new Error(`Error scenario ${error.code} not found in the error registry`);
    }

    const errorData = errorScenarios[error.code](error);

    if (errorData?.message) {
        return normalizeError(errorData);
    } else {
        throw new Error(`Error scenario ${error.code} returned invalid data: ${errorData}`);
    }
}

const errorFromCodes = (errorCode) => {
    const baseError = ERROR_CODES[errorCode];

    if (!baseError) {
        throw new Error(`Error code ${errorCode} not found in the error registry`);
    }

    return normalizeError(baseError);
}

const normalizeError = (error) => {
    return {
        message: error.message,
        code: error.code,
        details: error.details ?? null,
        statusCode: error.statusCode ?? 500,
        isOperational: error.isOperational ?? false,
    }
}

module.exports = ErrorRegistry;
