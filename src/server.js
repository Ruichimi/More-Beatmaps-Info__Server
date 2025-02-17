require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const path = require('path');
const OsuApi = require(path.resolve(__dirname, './services/OsuApiHelper'));
const { commandsRunning } = require('./commands/ServerRunningCommandsInterface');

//TODO: Сделать команды для очистки кеша
//TODO: (Опционально) Сохранять очищенный файловый кеш куда нибудь
//TODO: Если кеш планируется очень большой то сделать очистку по командам вместо автоматической

app.use(express.json({ limit: '1mb' }));

const corsOptions = {
    origin: 'https://osu.ppy.sh',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));

app.get('/', async (req, res) => {
    res.send('Hello World!');
});

app.get('/api/MapsetData/:id', async (req, res) => {
    const mapsetId = req.params.id;
    try {
        const data = await OsuApi.getMapsetData(mapsetId);
        res.json(data);
    } catch (error) {
        console.error("Ошибка получения данных:", error);
        res.status(500).json({ error: "Ошибка получения данных" });
    }
});

app.get('/api/BeatmapData/:id', async (req, res) => {
    const beatmapId = req.params.id;
    try {
        const data = await OsuApi.getBeatmapData(beatmapId);
        res.json(data);
    } catch (error) {
        console.error("Ошибка получения данных:", error);
        res.status(500).json({ error: "Ошибка получения данных" });
    }
});

app.post('/api/BeatmapPP/:id', express.json(), async (req, res) => {
    const { id: beatmapId } = req.params;
    const { beatmap } = req.body;
    try {
        const calculatedBeatmapData = await OsuApi.getBeatmapData(beatmapId, beatmap);
        res.json(calculatedBeatmapData);
    } catch (error) {
        res.status(500).json({ error: "Ошибка получения данных" });
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

    "ram-clean-bs": (amount) => console.log(OsuApi.getBeatmapByIdCache(amount)),
    "ram-clean-bm": (amount) => console.log(OsuApi.getBeatmapByIdCache(amount)),
};

// Вызов команд
commandsRunning({
    ...fileCacheCommands,
    ...ramCacheCommands
});

