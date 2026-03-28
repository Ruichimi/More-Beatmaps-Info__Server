const ERROR_CODES = require('$/errors/errorCodes');
const defaultServerErrorResponse = ERROR_CODES.DEFAULT_ERROR;

/**
 * @param {string} errorCode
 * @param {Object} errorData
 * @returns {{
 *    message: string,
 *    statusCode: number,
 *    code: string,
 *    details: any
 *  }}
 */
const getErrorData = (errorCode, errorData) => {
    // Copy the object to prevent mutation of the original
    let result = { ...errorData };

    if (errorData.defaultServerError === true) {
        return defaultServerErrorResponse;
    }

    if (typeof errorData?.message !== 'string' || !isValidStatusCode(errorData.statusCode)) {
        throw new Error(`Invalid error data: ${JSON.stringify(errorData)}`);
    }

    if (!errorData.hasOwnProperty('code') || typeof errorData.code !== 'string') {
        result.code = errorCode;
    }

    if (!errorData.details) {
        result.details = null;
    }

    return result;
};

const isValidStatusCode = (statusCode) =>
    Number.isInteger(statusCode) &&
    statusCode >= 400 &&
    statusCode <= 599;

module.exports = getErrorData;
