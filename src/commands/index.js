const OsuApi = require('../services/OsuApi/OsuApiHelper');
const BeatmapsLoader = require('../services/OsuApi/BeatmapsLoader');
const users = require('$/models/users');

const dbCommands = {
    "size-bs": async () => console.log(
        'DB Cache size (beatmapset):',
        await OsuApi.getCacheSize('beatmapset')
    ),

    "size-bm": async () => console.log(
        'DB Cache size (beatmap):',
        await OsuApi.getCacheSize('beatmap')
    ),

    "bs": (id) => OsuApi.getObjectByIdFromDB(id, 'beatmapset'),
    "bm": (id) => OsuApi.getObjectByIdFromDB(id, 'beatmap'),
};

const functionCommands = {
    "clean-archive-bs": () => OsuApi.cleanObjectArchive('beatmapset'),
    "clean-archive-bm": () => OsuApi.cleanObjectArchive('beatmap'),

    "clean-bs": (amount) => OsuApi.cleanItemsAmount('beatmapset', amount),
    "clean-bm": (amount) => OsuApi.cleanItemsAmount('beatmap', amount),

    "fake-bs": (amount) => OsuApi.createFakeEntries('beatmapset', amount),
    "fake-bm": (amount) => OsuApi.createFakeEntries('beatmap', amount),

    "fetch-bss": (timeInMinutes, startId) =>
        BeatmapsLoader.startFetching(timeInMinutes, startId),
};

const userCommands = {
    "users": (raw) =>
        console.log('List of all users\n', users.getAllUsers(raw)),

    "user": (numOrIP, raw) =>
        console.log(users.getUserByIdCounterOrIP(numOrIP, !raw)),

    "ban-ip": (ip) => users.banIP(ip),
    "unban-ip": (ip) => users.unbanIP(ip),
};

module.exports = {
    ...dbCommands,
    ...functionCommands,
    ...userCommands,
};
