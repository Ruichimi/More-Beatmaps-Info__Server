const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const feedbackRoutes = require('./feedback');
const mapsetsRoutes = require('./mapsets');
const beatmapsRoutes = require('./beatmaps');

router.use(authRoutes);
router.use(feedbackRoutes);
router.use(mapsetsRoutes);
router.use(beatmapsRoutes);

module.exports = router;
