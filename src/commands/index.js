const CacheManager = require('$/infrastructure/cache-manager');
const cacheManager = new CacheManager();
const BeatmapsLoader = require('$/utils/beatmaps-loader');
const users = require('$/models/users');

const dbCommands = {
    "size-bs": async () => console.log(
        'DB Cache size (beatmapset):',
        await cacheManager.getCacheSize('beatmapset')
    ),

    "size-bm": async () => console.log(
        'DB Cache size (beatmap):',
        await cacheManager.getCacheSize('beatmap')
    ),

    "bs": (id) => cacheManager.getObjectByIdFromDB(id, 'beatmapset'),
    "bm": (id) => cacheManager.getObjectByIdFromDB(id, 'beatmap'),
};

const functionCommands = {
    "clean-archive-bs": () => cacheManager.cleanObjectArchive('beatmapset'),
    "clean-archive-bm": () => cacheManager.cleanObjectArchive('beatmap'),

    "clean-bs": (amount) => cacheManager.cleanItemsAmount('beatmapset', amount),
    "clean-bm": (amount) => cacheManager.cleanItemsAmount('beatmap', amount),

    "fake-bs": (amount) => cacheManager.createFakeEntries('beatmapset', amount),
    "fake-bm": (amount) => cacheManager.createFakeEntries('beatmap', amount),

    "fetch-bss": (amount, startId) =>
        BeatmapsLoader.startFetching(amount, startId),
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
