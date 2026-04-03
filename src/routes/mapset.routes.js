const express = require('express');
const router = express.Router();

const verifyIPBan = require("$/middlewares/verifyIPBan");
const requestLimit = require("$/middlewares/rateLimiters");
const authenticateToken = require("$/middlewares/jwt");
const mapsetsController = require('$/controllers/mapsets.controller');

router.get(
    '/api/MapsetsData',
    verifyIPBan,
    requestLimit(100, 60),
    authenticateToken,
    mapsetsController.getMapsetsData
);

router.post(
    '/api/updateMapset/:id',
    verifyIPBan, requestLimit(4, 60),
    authenticateToken,
    mapsetsController.updateMapset
);

module.exports = router;
