const AppError = require('./AppError');

const validationError = (msg = 'Validation error') =>
    new AppError(msg, 400, 'VALIDATION_ERROR');

const notFound = (msg = 'Not found') =>
    new AppError(msg, 404, 'NOT_FOUND');

const userNotFound = () =>
    new AppError('User not found', 404, 'USER_NOT_FOUND');

const invalidToken = () =>
    new AppError('Invalid token', 401, 'INVALID_TOKEN');

module.exports = {
    validationError,
    notFound,
    userNotFound,
    invalidToken,
};
