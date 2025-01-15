const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const path = require('path');
const OsuApi = require(path.resolve(__dirname, './services/OsuApiHelper'));
const { commandsRunning } = require('./commands/ServerRunningCommandsInterface');

app.use(express.json({ limit: '1mb' }));
app.use(cors());

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
        console.log(calculatedBeatmapData);
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


commandsRunning({
    "file-cache-size-bs": () => console.log('Размер долгого кеша:', OsuApi.getCacheSize('file')),
    "ram-cache-size-bs": () => console.log('Размер кеша оперативной памяти:', OsuApi.getCacheSize('ram')),
    "entire-ram-cache": () => console.log('Кеш оперативной памяти:', OsuApi.getEntireBeatmapsetCache()),
    "file-cached-bs": (id) => console.log('Карта из долгого кеша:', OsuApi.getBeatmapsetByIdCache(id, 'file')),
    "ram-cached-bs": (id) => console.log('Карта из кеша оперативной памяти:', OsuApi.getBeatmapsetByIdCache(id, 'ram')),
});
