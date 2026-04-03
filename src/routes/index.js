const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const feedbackRoutes = require('./feedback.routes');
const mapsetsRoutes = require('./mapset.routes');
const beatmapsRoutes = require('./beatmap.routes');

router.use(authRoutes);
router.use(feedbackRoutes);
router.use(mapsetsRoutes);
router.use(beatmapsRoutes);

module.exports = router;
