const express = require('express');
const router = express.Router();
const OsuApi = require('./services/OsuApi/OsuApiHelper');
const { v4: uuidv4 } = require('uuid');

const jwt = require('jsonwebtoken');
const users = require('$/models/users');

const requestLimit = require('./middlewares/rateLimiters');
const RequestSizeLimit = require('./middlewares/requestSizeLimit');
const authenticateToken = require('./middlewares/jwt');
const verifyIPBan = require('./middlewares/verifyIPBan');

router.post('/api/token', requestLimit(7, 60), (req, res) => {
   try {
       const user = { id: uuidv4() };
       const token = jwt.sign(user, process.env.APP_KEY, { expiresIn: '100h' });
       users.addActiveUser(user, req.ip);
       res.json({ token });
   } catch (error) {
       console.error("Internal server error:", error);
       res.status(500).json({ error: "Internal server error" });
   }
});

router.get('/api/MapsetsData', verifyIPBan, requestLimit(100, 60), authenticateToken, async (req, res) => {
    const mapsetIds = req.query.mapsetsIds ? req.query.mapsetsIds.split(',') : [];
    let result = {};

    if (!Array.isArray(mapsetIds) || mapsetIds.length === 0) {
        return res.status(400).send('Expected an array of items');
    }

    try {
        for (const mapsetId of mapsetIds) {
            result[mapsetId] = await OsuApi.getMapsetData(mapsetId);
        }

        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error && error.message.startsWith('Too many requests to osu api')) {
            res.status(503).json({ error: "Server is currently overloaded, please try again later" });
            return;
        }
        console.error("Receiving data error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/api/cachedBeatmapsData', verifyIPBan, requestLimit(500, 90), authenticateToken, async (req, res) => {
    const beatmapIds = req.query.beatmapsIds ? req.query.beatmapsIds.split(',') : [];
    let result = {};

    if (!Array.isArray(beatmapIds) || beatmapIds.length === 0) {
        return res.status(400).send('Expected an array of items');
    }

    try {
        for (const beatmapId of beatmapIds) {
            result[beatmapId] = await OsuApi.tryGetBeatmapDataFromCache(beatmapId);
        }
        res.status(200).json(result);
    } catch (error) {
        console.error("Receiving data error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/api/BeatmapPP/:id', express.json(), verifyIPBan, requestLimit(15, 60), authenticateToken, RequestSizeLimit, async (req, res) => {
    const { id: beatmapId } = req.params;

    const { beatmap } = req.body;
    try {
        const calculatedBeatmapData = await OsuApi.getBeatmapData(beatmapId, beatmap);
        res.json(calculatedBeatmapData);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/api/updateMapset/:id', verifyIPBan, requestLimit(4, 60), authenticateToken, async (req, res) => {
    try {
        const mapsetId = req.params.id;
        const mapsetData = await OsuApi.getObject(mapsetId, 'beatmapset');
        if (!mapsetData) {
            res.status(400).json({ message: 'Invalid id' });
            return;
        }

        if (mapsetData.beatmaps) {
            for (const beatmap of mapsetData.beatmaps) {
                await OsuApi.removeObjectById(beatmap.id, 'beatmaps');
            }
        }

        await OsuApi.removeObjectById(mapsetId, 'mapsets');

        const updatedMapset = await OsuApi.getMapsetData(mapsetId);
        res.status(200).json(updatedMapset);
    } catch (error) {
        console.error('Failed to remove mapset:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
