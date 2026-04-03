const express = require('express');
const router = express.Router();

const beatmapsController = require('$/controllers/beatmaps.controller');

const requestLimit = require('$/middlewares/rateLimiters');
const authenticateToken = require('$/middlewares/jwt');
const verifyIPBan = require('$/middlewares/verifyIPBan');
const RequestSizeLimit = require('$/middlewares/requestSizeLimit');

router.get(
    '/api/cachedBeatmapsData',
    verifyIPBan,
    requestLimit(500, 90),
    authenticateToken,
    beatmapsController.getBeatmapsDataFromCache
);

router.post(
    '/api/BeatmapPP/:id',
    express.json(),
    verifyIPBan,
    requestLimit(15, 60),
    authenticateToken, RequestSizeLimit,
    beatmapsController.getBeatmapData
);

module.exports = router;
