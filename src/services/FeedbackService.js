const db = require('$/DB.js');
const ValidationError = require('$/errors/ValidationError');

class FeedbackService {
    async create({ type, message, email = null }) {
        if (!type || typeof type !== "string") {
            throw new ValidationError("Invalid feedback type");
        }

        if (!message || typeof message !== "string") {
            throw new ValidationError("Invalid feedback message");
        }

        if (email && typeof email !== "string") {
            throw new ValidationError("Invalid email");
        }

        const query = `
            INSERT INTO feedbacks (type, message, email)
            VALUES (?, ?, ?)
        `;

        return db.runAsync(query, [
            type.trim(),
            message.trim(),
            email?.trim() ?? null
        ]);
    }
}

module.exports = new FeedbackService();

