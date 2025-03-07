const rateLimit = require('express-rate-limit');

const tokenLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 минут
    max: 5, // 5 запросов за 5 минут
    message: { error: "Слишком много запросов. Попробуйте позже." }
});

const mapsetLimiter = rateLimit({
    windowMs: 15 * 1000,
    max: 30,
    message: { error: "Слишком много запросов. Попробуйте позже." }
});

const beatmapLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 150,
    message: { error: "Слишком много запросов. Попробуйте позже." }
});

module.exports = {
    tokenLimiter,
    mapsetLimiter,
    beatmapLimiter
};
