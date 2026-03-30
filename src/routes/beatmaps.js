const express = require('express');
const router = express.Router();

const OsuApi = require('../services/OsuApi/OsuApiHelper');

const requestLimit = require('../middlewares/rateLimiters');
const authenticateToken = require('../middlewares/jwt');
const verifyIPBan = require('../middlewares/verifyIPBan');
const RequestSizeLimit = require('../middlewares/requestSizeLimit');

router.get('/api/cachedBeatmapsData', verifyIPBan, requestLimit(500, 90), authenticateToken, async (req, res, next) => {
    const beatmapIds = req.query.beatmapsIds ? req.query.beatmapsIds.split(',') : [];
    let result = {};

    if (!Array.isArray(beatmapIds) || beatmapIds.length === 0) {
        return res.status(400).json({
            error: 'Missing beatmapsIds query parameter',
            example: '?beatmapsIds=5319044'
        });
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

module.exports = router;
