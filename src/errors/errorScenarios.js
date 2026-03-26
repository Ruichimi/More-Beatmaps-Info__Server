const errorScenarios = {
    //Test case
    VALIDATION_ERROR: (error) => {
        const originalError = error?.cause;
        if (originalError.code === 'MISSING_REQUIRED_FIELDS') {
            return {
                statusCode: 400,
                message: 'Invalid data',
                code: originalError.code,
                details: originalError.details
            };
        }

        return null;
    }
};

module.exports = errorScenarios;
