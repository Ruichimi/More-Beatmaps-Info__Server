function requestSizeLimit(err, req, res, next) {
    console.error("Ошибка парсинга JSON:", err);

    if (err instanceof SyntaxError && err.message.includes("JSON")) {
        return res.status(400).json({ error: "Некорректный JSON в запросе" });
    }

    if (err.status === 413) {
        return res.status(413).json({ error: "Превышен лимит данных (макс. 320 KB)" });
    }

    next(err);
}

module.exports = requestSizeLimit;
