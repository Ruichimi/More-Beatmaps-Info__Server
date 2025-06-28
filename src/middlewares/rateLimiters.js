const rateLimit = require('express-rate-limit');

const requestsLimit = (count, resetSec) => {
    return rateLimit({
        windowMs: resetSec * 1000,
        max: count,
        message: { error: "Too many requests, please try again later" }
    });
}

module.exports = requestsLimit;
