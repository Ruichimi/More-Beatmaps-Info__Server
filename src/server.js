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
    "size-bs": async () => console.log('Размер долгого кеша (beatmapset):', await OsuApi.getCacheSize('beatmapset')),
    "size-bm": async () => console.log('Размер долгого кеша (beatmapset):', await OsuApi.getCacheSize('beatmap')),
    "bs": (id) => console.log('Мапсет из долгого кеша (ID:', id, '):', OsuApi.getObjectByIdFromDB(id, 'beatmapset')),
    "bm": (id) => console.log('Карта из долгого кеша (ID:', id, '):', OsuApi.getObjectByIdFromDB(id, 'beatmap')),
};

const functionCommands = {
    "clean-bs": (amount) => console.log(OsuApi.cleanItemsAmount('beatmapset', amount)),
    "clean-bm": (amount) => console.log(OsuApi.cleanItemsAmount('beatmap', amount)),

    "fake-bs": (amount) => OsuApi.createFakeEntries('beatmapset', amount),
    "fake-bm": (amount) => OsuApi.createFakeEntries('beatmap', amount),
}

commandsRunning({
    ...fileCacheCommands,
    ...functionCommands
});
