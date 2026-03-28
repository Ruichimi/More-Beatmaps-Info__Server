const errorScenarios = require('$/errors/errorScenarios');
const ERROR_CODES = require('$/errors/errorCodes');
const getErrorData = require('$/errors/errorResolver');

const processError = (error) => {
    const errorCode = error?.code;

    let errorData;

    if (errorScenarios[errorCode])
        errorData = errorScenarios[errorCode](error);
    else if (ERROR_CODES[errorCode])
        errorData = ERROR_CODES[errorCode];
    else
        errorData = ERROR_CODES.DEFAULT_ERROR;

    console.log('Error data:', errorData);

    return getErrorData(errorCode, errorData);
};

module.exports = processError;
