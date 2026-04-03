module.exports = {
    DEFAULT_ERROR: {
        message: 'Internal server error',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        details: null,
    },

    UNKNOWN_ERROR: {
        defaultServerError: true,
    },

    BEATMAPS_FILTER_ERROR: {
        defaultServerError: true,
    },

    BEATMAPSET_NOT_FOUND: {
        message: 'Requested beatmapset not found',
        statusCode: 404,
        isOperational: true,
    },

    OSU_API_ERROR: {
        message: 'Required external service is unavailable',
        statusCode: 503,
        code: 'SERVICE_DEPENDENCY_UNAVAILABLE',
        isOperational: true,
    },

    SERVER_OVERLOADED: {
        message: 'Server is overloaded, please try again later',
        statusCode: 503,
        isOperational: true,
    },

    INVALID_BEATMAP_STRUCTURE: {
        message: 'Invalid beatmap structure',
        statusCode: 400,
        isOperational: true,
    },

    FAILED_UPDATE_MAPSET: {
        message: 'Failed to update mapset. Maybe the wrong ID was provided.',
        statusCode: 400,
        isOperational: true,
    },

    INVALID_MAPSET_ID_CLIENT: {
        message: 'Invalid mapset ID was provided',
        statusCode: 400,
        isOperational: true,
    }
};
