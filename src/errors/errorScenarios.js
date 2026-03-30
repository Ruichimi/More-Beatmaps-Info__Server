const errorScenarios = {
    VALIDATION_ERROR: (error) => {
        return {
            message: 'Validation failed',
            statusCode: 400,
            code: error.code,
            details: error.details,
            isOperational: true
        };
    }
};

module.exports = errorScenarios;
