require('dotenv').config();
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middlewares/jwt');
const RequestSizeLimit = require('./middlewares/RequestSizeLimit');
const { tokenLimiter, mapsetLimiter, beatmapLimiter } = require('./middlewares/rateLimiters');
const {v4: uuidv4} = require('uuid');
const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const path = require('path');
const OsuApi = require(path.resolve(__dirname, './services/OsuApiHelper'));
const {commandsRunning} = require('./commands/ServerRunningCommandsInterface');

app.use(express.json({ limit: '320kb' }));


const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: "Authorization, Content-Type, x-client-id, x-retry-request"
};

app.use(cors(corsOptions));

app.get('/', async (req, res) => {
    res.send('Hello World!');
});

app.post('/api/token', tokenLimiter, (req, res) => {    console.log('Запрос на новый токен');
    const user = {id: uuidv4()};

    const token = jwt.sign(user, process.env.APP_KEY, {expiresIn: '100h'});

    res.json({token});
});

app.get('/api/MapsetData/:id', authenticateToken, mapsetLimiter, RequestSizeLimit, async (req, res) => {
    const mapsetId = req.params.id;

    try {
        const data = await OsuApi.getMapsetData(mapsetId);
        res.json(data);
    } catch (err) {
        console.error("Failed to get data:", err);
        res.status(500).json({error: "failed to get data"});
    }
});

app.get('/api/MapsetsData', authenticateToken, mapsetLimiter, RequestSizeLimit, async (req, res) => {
    const items = req.query.mapsetsIds ? req.query.mapsetsIds.split(',') : [];
    console.log(items);
    let result = {};

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).send('Expected an array of items');
    }

    try {
        for (const item of items) {
            result[item] = await OsuApi.getMapsetData(item);
        }
        res.status(200).json(result);
    } catch (err) {
        console.error("Failed to get data:", err);
        res.status(500).json({error: "failed to get data"});
    }
});


app.post('/api/BeatmapPP/:id', express.json(), authenticateToken, RequestSizeLimit, beatmapLimiter, async (req, res) => {
    const {id: beatmapId} = req.params;
    const {beatmap} = req.body;
    try {
        const calculatedBeatmapData = await OsuApi.getBeatmapData(beatmapId, beatmap);
        res.json(calculatedBeatmapData);
    } catch (error) {
        res.status(500).json({error: "Ошибка получения данных"});
    }
});

/**
 * Currently unused route, because of top one
 */

app.get('/api/BeatmapData/:id', authenticateToken, RequestSizeLimit, async (req, res) => {
    const beatmapId = req.params.id;
    try {
        const data = await OsuApi.getBeatmapData(beatmapId);
        res.json(data);
    } catch (error) {
        console.error("Ошибка получения данных:", error);
        res.status(500).json({error: "Ошибка получения данных"});
    }
});

app.listen(port, async () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    try {
        await OsuApi.init();
        console.log("OsuApiHelper инициализирован.");
    } catch (error) {
        console.error("Ошибка при инициализации OsuApiHelper:", error);
    }
});


const fileCacheCommands = {
    "file-size-bs": () => console.log('Размер долгого кеша (beatmapset):', OsuApi.getCacheSize('beatmapset', 'file')),
    "file-cached-bs": (id) => console.log('Карта из долгого кеша (ID:', id, '):', OsuApi.getBeatmapsetByIdCacheFile(id)),
};

const ramCacheCommands = {
    "ram-size-bs": () => console.log('Размер кеша оперативной памяти (beatmapset):', OsuApi.getCacheSize('beatmapset', 'ram')),
    "ram-size-bm": () => console.log('Размер кеша оперативной памяти (beatmap):', OsuApi.getCacheSize('beatmap', 'ram')),

    "ram-all-bs": () => console.log('Весь кеш оперативной памяти (beatmapset):', OsuApi.getEntireBeatmapsetCache()),
    "ram-all-bm": () => console.log('Весь кеш оперативной памяти (beatmaps):', OsuApi.getEntireBeatmapsCache()),

    "ram-cached-bs": (id, raw) => console.log('Карта из кеша оперативной памяти (ID:', id, '):', OsuApi.getBeatmapsetByIdCache(id, raw)),
    "ram-cached-bm": (id, raw) => console.log('Мапсет из кеша оперативной памяти (ID:', id, '):', OsuApi.getBeatmapByIdCache(id, raw)),
};

const functionCommands = {
    "clean-bs": (amount) => console.log(OsuApi.cleanRamCacheIfNeeded('beatmapset', amount)),
    "clean-bm": (amount) => console.log(OsuApi.cleanRamCacheIfNeeded('beatmap', amount)),
}

commandsRunning({
    ...fileCacheCommands,
    ...ramCacheCommands,
    ...functionCommands
});
