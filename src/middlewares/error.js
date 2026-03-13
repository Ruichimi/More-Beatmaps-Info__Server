module.exports = (err, req, res, next) => {
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
            details: err.details
        });
    }

    console.error(err.stack);

    res.status(500).json({
        error: 'Internal server error'
    });
};
