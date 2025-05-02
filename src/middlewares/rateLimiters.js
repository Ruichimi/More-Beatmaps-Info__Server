const rateLimit = require('express-rate-limit');

const requestsLimit = (count, resetSec) => {
    return rateLimit({
        windowMs: resetSec * 1000,
        max: count,
        message: { error: "Слишком много запросов. Попробуйте позже." }
    });
}

module.exports = requestsLimit;
