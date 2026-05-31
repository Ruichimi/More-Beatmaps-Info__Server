const db = require('$/infrastructure/db-initializer.js');
const { validationError } = require('$/errors/AppError.js');

class FeedbackService {
    async create({ type, message, email = null }) {
        if (!type || typeof type !== "string") {
            throw validationError("Invalid feedback type");
        }

        if (!message || typeof message !== "string") {
            throw validationError("Invalid feedback message");
        }

        if (email && typeof email !== "string") {
            throw validationError("Invalid email");
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

    async getAllQuestions() {
        const query = `
            SELECT *
            FROM feedbacks
            WHERE type = 'question'
        `;

        const records = await db.allAsync(query);

        return records.map(record => ({
            id: record.id,
            message: record.message,
            email: record.email
        }));
    }

    async getAllSuggestions() {
        const query = `
            SELECT *
            FROM feedbacks
            WHERE type = 'suggestion'
        `;

        const records = await db.allAsync(query);

        return records.map(record => ({
            id: record.id,
            message: record.message
        }));
    }
}

module.exports = new FeedbackService();

