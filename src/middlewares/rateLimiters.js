const rateLimit = require('express-rate-limit');

const tokenLimiter = rateLimit({
    windowMs: 30 * 1000,
    max: 10,
    message: { error: "Слишком много запросов. Попробуйте позже." }
});

const mapsetLimiter = rateLimit({
    windowMs: 15 * 1000,
    max: 500,
    message: { error: "Слишком много запросов. Попробуйте позже." }
});

const beatmapLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 500,
    message: { error: "Слишком много запросов. Попробуйте позже." }
});

module.exports = {
    tokenLimiter,
    mapsetLimiter,
    beatmapLimiter
};
