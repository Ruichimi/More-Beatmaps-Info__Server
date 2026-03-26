module.exports = {
    UNKNOWN_ERROR: {
        message: 'Unknown server error',
        statusCode: 500,
        code: 'UNKNOWN_ERROR',
    },

    BEATMAPSET_NOT_FOUND: {
        message: 'Requested beatmapset not found',
        statusCode: 404,
        code: 'BEATMAPSET_NOT_FOUND',
    },

    OSU_API_ERROR: {
        message: 'Required external service is unavailable',
        statusCode: 503,
        code: 'SERVICE_DEPENDENCY_UNAVAILABLE',
    },

    SERVER_OVERLOADED: {
        message: 'Server is overloaded, please try again later',
        statusCode: 503,
        code: 'SERVER_OVERLOADED',
    },

    INVALID_BEATMAP_STRUCTURE: {
        message: 'Invalid beatmap structure',
        statusCode: 400,
        code: 'INVALID_BEATMAP_STRUCTURE',
    },
};
