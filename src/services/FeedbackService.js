const db = require('$/DB.js');

class FeedbackService {
    async create({ type, message, email = null }) {
        if (!type || typeof type !== "string") {
            throw new Error("Feedback type is required and must be a string");
        }

        if (!message || typeof message !== "string") {
            throw new Error("Feedback message is required and must be a string");
        }

        if (email && typeof email !== "string") {
            throw new Error("Email must be a string");
        }

        const query = `
            INSERT INTO feedbacks (type, message, email)
            VALUES (?, ?, ?)
        `;

        return db.runAsync(query, [type.trim(), message.trim(), email?.trim() ?? null]);
    }
}

module.exports = new FeedbackService();
