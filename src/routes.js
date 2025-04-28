const express = require('express');
const router = express.Router();
const { tokenLimiter, mapsetLimiter, beatmapLimiter, cachedBeatmapLimiter } = require('./middlewares/rateLimiters');
const RequestSizeLimit = require('./middlewares/RequestSizeLimit');
const authenticateToken = require('./middlewares/jwt');
const verifyIPBan = require('./middlewares/verifyIPBan');
const OsuApi = require('./services/OsuApi/OsuApiHelper');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const users = require('$/models/users');

router.get('/', async (req, res) => {
    res.send('Hello World!');
});

router.post('/api/token', tokenLimiter, (req, res) => {
    console.log('Запрос на новый токен');
    const user = { id: uuidv4() };
    users.addActiveUser(user, req.ip);
    const token = jwt.sign(user, process.env.APP_KEY, { expiresIn: '100h' });
    res.json({ token });
});

router.get('/api/MapsetsData', mapsetLimiter, verifyIPBan, RequestSizeLimit, async (req, res) => {
    const mapsetIds = req.query.mapsetsIds ? req.query.mapsetsIds.split(',') : [];
    let result = {};

    if (!Array.isArray(mapsetIds) || mapsetIds.length === 0) {
        return res.status(400).send('Expected an array of items');
    }

    try {
        for (const mapsetId of mapsetIds) {
            result[mapsetId] = await OsuApi.getMapsetData(mapsetId, true);
            //console.log(result[item]);
        }

        res.status(200).json(result);
    } catch (err) {
        console.error("Failed to get data:", err);
        res.status(500).json({ error: "failed to get data" });
    }
});

router.get('/api/cachedBeatmapsData', authenticateToken, cachedBeatmapLimiter, async (req, res) => {
    const beatmapIds = req.query.beatmapsIds ? req.query.beatmapsIds.split(',') : [];
    let result = {};
    //console.log('Trying to get cached data to beatmaps\n', beatmapIds);
    if (!Array.isArray(beatmapIds) || beatmapIds.length === 0) {
        return res.status(400).send('Expected an array of items');
    }

    try {
        for (const beatmapId of beatmapIds) {
            result[beatmapId] = await OsuApi.tryGetBeatmapDataFromCache(beatmapId);
            //console.log(result[item]);
        }
        res.status(200).json(result);
    } catch (error) {
        console.error("Ошибка получения данных:", error);
        res.status(500).json({ error: "Ошибка получения данных" });
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
