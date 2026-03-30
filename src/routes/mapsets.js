const express = require('express');
const router = express.Router();

const verifyIPBan = require("../middlewares/verifyIPBan");
const requestLimit = require("../middlewares/rateLimiters");
const authenticateToken = require("../middlewares/jwt");
const OsuApi = require("../services/OsuApi/OsuApiHelper");

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
