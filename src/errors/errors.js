import { AppError } from './AppError.js';

export const Errors = {
    ValidationError: (msg = 'Validation error') =>
        new AppError(msg, 401, 'VALIDATION_ERROR'),

    NotFound: (msg = 'Not found') =>
        new AppError(msg, 404, 'NOT_FOUND'),

    UserNotFound: () =>
        new AppError('User not found', 404, 'USER_NOT_FOUND'),

    InvalidToken: () =>
        new AppError('Invalid token', 401, 'INVALID_TOKEN'),
};
