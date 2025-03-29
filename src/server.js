const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 3000;
const routes = require('./routes');
const { commandsRunning } = require('./commands/ServerRunningCommandsInterface');
const OsuApi = require('./services/OsuApiHelper');

app.use(express.json({ limit: '320kb' }));

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: "Authorization, Content-Type, x-client-id, x-retry-request"
};

app.use(cors(corsOptions));
app.use(routes);

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
    "file-cached-bs": (id) => console.log('Мапсет из долгого кеша (ID:', id, '):', OsuApi.getObjectByIdFromDB(id, 'beatmapset')),
    "file-cached-bm": (id) => console.log('Карта из долгого кеша (ID:', id, '):', OsuApi.getObjectByIdFromDB(id, 'beatmap')),
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
