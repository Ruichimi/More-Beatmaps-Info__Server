const rateLimit = require('express-rate-limit');

const tokenLimiter = rateLimit({
    windowMs: 30 * 1000,
    max: 10,
    message: { error: "Слишком много запросов. Попробуйте позже." }
});

const mapsetLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 250,
    message: { error: "Слишком много запросов. Попробуйте позже." }
});

const beatmapLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: "Слишком много запросов. Попробуйте позже." }
});

const cachedBeatmapLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    message: { error: "Слишком много запросов. Попробуйте позже." }
});

module.exports = {
    tokenLimiter,
    mapsetLimiter,
    beatmapLimiter,
    cachedBeatmapLimiter
};
