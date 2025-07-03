const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('module-alias/register');

const app = express();

const port = 3000;
const routes = require('./routes');
const { commandsRunning } = require('./commands/ServerRunningCommandsInterface');
const OsuApi = require('./services/OsuApi/OsuApiHelper');
const BeatmapsLoader = require('./services/OsuApi/BeatmapsLoader');
const users = require('$/models/users');

app.set('trust proxy', 1);
app.use(express.json({ limit: '320kb' }));

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: "Authorization, Content-Type, x-client-id, x-retry-request"
};

app.use(cors(corsOptions));
app.use(routes);

app.listen(port, '127.0.0.1', async () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});

const fileCacheCommands = {
    "size-bs": async () => console.log('Размер долгого кеша (beatmapset):',
        await OsuApi.getCacheSize('beatmapset')),

    "size-bm": async () => console.log('Размер долгого кеша (beatmap):',
        await OsuApi.getCacheSize('beatmap')),

    "bs": (id) => OsuApi.getObjectByIdFromDB(id, 'beatmapset'),

    "bm": (id) =>  OsuApi.getObjectByIdFromDB(id, 'beatmap'),
};

const functionCommands = {
    "clean-archive-bs": () => OsuApi.cleanObjectArchive('beatmapset'),
    "clean-archive-bm": () => OsuApi.cleanObjectArchive('beatmap'),

    "clean-bs": (amount) => OsuApi.cleanItemsAmount('beatmapset', amount),
    "clean-bm": (amount) => OsuApi.cleanItemsAmount('beatmap', amount),

    "fake-bs": (amount) => OsuApi.createFakeEntries('beatmapset', amount),
    "fake-bm": (amount) => OsuApi.createFakeEntries('beatmap', amount),

    "fetch-bss": (timeInMinutes, startId) => BeatmapsLoader.startFetching(timeInMinutes, startId)
}

const usersCommands = {
    "users": (raw) => console.log('Список всех пользователей\n', users.getAllUsers(raw)),
    "ban-ip": (ip) => users.banIP(ip),
    "unban-ip": (ip) => users.unbanIP(ip),
}

commandsRunning({
    ...fileCacheCommands,
    ...functionCommands,
    ...usersCommands,
});
