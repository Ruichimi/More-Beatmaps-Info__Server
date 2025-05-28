const express = require('express');
const router = express.Router();
const OsuApi = require('./services/OsuApi/OsuApiHelper');
const { v4: uuidv4 } = require('uuid');

const jwt = require('jsonwebtoken');
const users = require('$/models/users');

const requestLimit = require('./middlewares/rateLimiters');
const RequestSizeLimit = require('./middlewares/RequestSizeLimit');
const authenticateToken = require('./middlewares/jwt');
const verifyIPBan = require('./middlewares/verifyIPBan');

router.post('/api/token', requestLimit(10, 60), (req, res) => {
    console.log('Запрос на новый токен');
    const user = { id: uuidv4() };
    users.addActiveUser(user, req.ip);
    const token = jwt.sign(user, process.env.APP_KEY, { expiresIn: '100h' });
    res.json({ token });
});

router.get('/api/MapsetsData', verifyIPBan, requestLimit(200, 60), authenticateToken, async (req, res) => {
    const mapsetIds = req.query.mapsetsIds ? req.query.mapsetsIds.split(',') : [];
    let result = {};

    if (!Array.isArray(mapsetIds) || mapsetIds.length === 0) {
        return res.status(400).send('Expected an array of items');
    }

    try {
        for (const mapsetId of mapsetIds) {
            result[mapsetId] = await OsuApi.getMapsetData(mapsetId);
            //console.log(result[item]);
        }

        res.status(200).json(result);
    } catch (err) {
        console.error("Failed to get data:", err);
        res.status(500).json({ error: "failed to get data" });
    }
});

router.get('/api/cachedBeatmapsData', verifyIPBan, requestLimit(200, 60), authenticateToken, async (req, res) => {
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

router.post('/api/BeatmapPP/:id', express.json(), verifyIPBan, requestLimit(15, 60), authenticateToken, RequestSizeLimit, async (req, res) => {
    const { id: beatmapId } = req.params;

    const { beatmap } = req.body;
    try {
        const calculatedBeatmapData = await OsuApi.getBeatmapData(beatmapId, beatmap);
        res.json(calculatedBeatmapData);
    } catch (error) {
        res.status(500).json({ error: "Ошибка получения данных" });
    }
});

router.post('/api/updateMapset/:id', verifyIPBan, requestLimit(2, 60), authenticateToken, async (req, res) => {
    try {
        const mapsetId = req.params.id;
        const mapsetData = await OsuApi.getObject(mapsetId, 'beatmapset');
        if (!mapsetData) {
            res.status(400).json({ message: 'Invalid id' });
            return;
        }
        for (const beatmap of mapsetData.beatmaps) {
            await OsuApi.removeObjectById(beatmap.id, 'beatmaps');
        }
        await OsuApi.removeObjectById(mapsetId, 'mapsets');

        const updatedMapset = await OsuApi.getMapsetData(mapsetId);
        res.status(200).json(updatedMapset);
    } catch (error) {
        console.error('Failed to remove mapset:', error);
        res.status(500).json({ error: 'Failed to remove mapset' });
    }
});

module.exports = router;
