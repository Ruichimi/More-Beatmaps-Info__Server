const RamCacher = require("./RamCacher");
const FileCacher = require("./FileCacher");
const BeatmapsFilter = require('./BeatmapsFilter');

class CacheManager {
    constructor() {
        this.beatmapSetsCacheLimit = 1000;
        this.beatmapSetsCacheCleanItems = 500;
        this.beatmapCacheLimit = 500;
        this.beatmapCacheCleanItems = 300;
    }

    getObjectFromCache(objectId, objectType) {
        const cachedObject = RamCacher.getObjectById(objectId, objectType);
        if (cachedObject) {
            console.log(`The ${objectType} ${objectId} data received from RAM cache`);
            return cachedObject;
        }
    }

    cacheBeatmapset(mapsetData) {
        let filteredMapset = BeatmapsFilter.filterBeatmapset(mapsetData);
        this.cacheObject(filteredMapset, 'beatmapset', this.beatmapSetsCacheLimit, this.beatmapSetsCacheCleanItems);
    }

    cacheBeatmap(beatmapData) {
        let filteredBeatmapData = BeatmapsFilter.filterBeatmap(beatmapData);
        this.cacheObject(filteredBeatmapData, 'beatmap', this.beatmapCacheLimit, this.beatmapCacheCleanItems);
    }

    cacheObject(object, objectType, cacheLimit, cacheSize, cleanItems) {
        if (RamCacher[`${objectType}sCache`].size >= cacheLimit) {
            const clearedRamData = RamCacher.clearOldObjectsByDate(objectType, cleanItems);
            FileCacher.writeToFile(clearedRamData, objectType);
        }
        object.date = Date.now();
        const objectId = String(object.id);
        delete object.id;

        FileCacher.appendToFile(object, objectId, objectType);
        RamCacher.setObject(object, objectId, cacheLimit, objectType);
    }

    loadObjectItemsToRamFromFile(dataType) {
        let cachedItemsCount = 0;
        const mapsetsFileCached = FileCacher.getEntireBeatmapsetsCache(dataType);

        for (const [key, mapset] of Object.entries(mapsetsFileCached)) {
            RamCacher.setObject(mapset, key, this.beatmapSetsCacheLimit, dataType);
            cachedItemsCount++;
        }
        console.log(`${cachedItemsCount} ${dataType}s загруженны в оперативную память`);
    }

    getCacheSize(cacheType) {
        let parsedData = null;
        if (cacheType === 'ram') {
            parsedData = RamCacher.getBeatmapsetsCacheObject();
        } else if (cacheType === 'file') {
            parsedData = FileCacher.getEntireBeatmapsetsCache('beatmapset');
        } else {
            console.log('Попытка получить неверный тип кеша, доступные типы: \'ram\' \'file\'');
        }

        if (typeof parsedData !== 'object' || parsedData === null) {
            console.log('Файл кэша содержит некорректные данные.');
            return {sizeInBytes: 0, numberOfEntries: 0};
        }
        const sizeInBytes = new TextEncoder().encode(JSON.stringify(parsedData)).length;
        const numberOfEntries = Object.keys(parsedData).length;

        return {sizeInBytes, numberOfEntries};
    }

    getBeatmapsetByIdCache(id, raw = false) {
        if (raw) return RamCacher.beatmapsetsCache.get(id);
        return RamCacher.getObjectById(id, 'beatmapset');
    }

    getBeatmapByIdCache(id, raw = false) {
        if (raw) return RamCacher.beatmapsCache.get(id);
        return RamCacher.getObjectById(id, 'beatmap');
    }

    getEntireBeatmapsetCache() {
        return RamCacher.beatmapsetsCache;
    }

    getEntireBeatmapsCache() {
        return RamCacher.beatmapsCache;
    }

    getBeatmapsetByIdCacheFile(id) {
        try {
            return FileCacher.getBeatmapsetFromCacheByKey(id);
        } catch (err) {
            console.log(`Не удалось получить карту из файла кеша ${err}`);
        }
    }
}

module.exports = CacheManager;
