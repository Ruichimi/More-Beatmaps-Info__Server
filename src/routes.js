const express = require('express');
const router = express.Router();
const { tokenLimiter, mapsetLimiter, beatmapLimiter } = require('./middlewares/rateLimiters');
const RequestSizeLimit = require('./middlewares/RequestSizeLimit');
const authenticateToken = require('./middlewares/jwt');
const OsuApi = require('./services/OsuApiHelper');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
    res.send('Hello World!');
});

router.post('/api/token', tokenLimiter, (req, res) => {
    console.log('Запрос на новый токен');
    const user = { id: uuidv4() };
    const token = jwt.sign(user, process.env.APP_KEY, { expiresIn: '100h' });
    res.json({ token });
});

router.get('/api/MapsetData/:id', authenticateToken, mapsetLimiter, RequestSizeLimit, async (req, res) => {
    const mapsetId = req.params.id;
    try {
        const data = await OsuApi.getMapsetData(mapsetId);
        res.json(data);
    } catch (err) {
        console.error("Failed to get data:", err);
        res.status(500).json({ error: "failed to get data" });
    }
});

router.get('/api/MapsetsData', authenticateToken, mapsetLimiter, RequestSizeLimit, async (req, res) => {
    const items = req.query.mapsetsIds ? req.query.mapsetsIds.split(',') : [];
    let result = {};

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).send('Expected an array of items');
    }

    try {
        for (const item of items) {
            result[item] = await OsuApi.getMapsetData(item);
        }
        res.status(200).json(result);
    } catch (err) {
        console.error("Failed to get data:", err);
        res.status(500).json({ error: "failed to get data" });
    }
});

router.post('/api/BeatmapPP/:id', express.json(), authenticateToken, RequestSizeLimit, beatmapLimiter, async (req, res) => {
    const { id: beatmapId } = req.params;
    const { beatmap } = req.body;
    try {
        const calculatedBeatmapData = await OsuApi.getBeatmapData(beatmapId, beatmap);
        res.json(calculatedBeatmapData);
    } catch (error) {
        res.status(500).json({ error: "Ошибка получения данных" });
    }
});

router.get('/api/BeatmapData/:id', authenticateToken, RequestSizeLimit, async (req, res) => {
    const beatmapId = req.params.id;
    try {
        const data = await OsuApi.getBeatmapData(beatmapId);
        res.json(data);
    } catch (error) {
        console.error("Ошибка получения данных:", error);
        res.status(500).json({ error: "Ошибка получения данных" });
    }
});

module.exports = router;
