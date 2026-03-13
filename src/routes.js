const express = require('express');
const router = express.Router();
const OsuApi = require('./services/OsuApi/OsuApiHelper');
const Feedback = require('./services/FeedbackService');
const { v4: uuidv4 } = require('uuid');

const jwt = require('jsonwebtoken');
const users = require('$/models/users');

const requestLimit = require('./middlewares/rateLimiters');
const RequestSizeLimit = require('./middlewares/requestSizeLimit');
const authenticateToken = require('./middlewares/jwt');
const verifyIPBan = require('./middlewares/verifyIPBan');

router.post('/api/feedback', requestLimit(10, 60), async (req, res, next) => {
    try {
        await Feedback.create({
            email: req.body.email,
            type: req.body.type,
            message: req.body.message
        });

        res.status(200).json({ message: 'Feedback sent successfully' });
    } catch (error) {
        next(error);
    }
});

router.post('/api/token', requestLimit(7, 60), (req, res, next) => {
   try {
       const user = { id: uuidv4() };
       const token = jwt.sign(user, process.env.APP_KEY, { expiresIn: '100h' });
       users.addActiveUser(user, req.ip);
       res.json({ token });
   } catch (error) {
       next(error);
   }
});

router.get('/api/MapsetsData', verifyIPBan, requestLimit(100, 60), authenticateToken, async (req, res, next) => {
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
        next(error);
    }
});

router.get('/api/cachedBeatmapsData', verifyIPBan, requestLimit(500, 90), authenticateToken, async (req, res, next) => {
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
        next(error);
    }
});

router.post('/api/BeatmapPP/:id', express.json(), verifyIPBan, requestLimit(15, 60), authenticateToken, RequestSizeLimit, async (req, res, next) => {
    const { id: beatmapId } = req.params;

    const { beatmap } = req.body;
    try {
        const calculatedBeatmapData = await OsuApi.getBeatmapData(beatmapId, beatmap);
        res.json(calculatedBeatmapData);
    } catch (error) {
        next(error);
    }
});

router.post('/api/updateMapset/:id', verifyIPBan, requestLimit(4, 60), authenticateToken, async (req, res, next) => {
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
        next(error);
    }
});

module.exports = router;
