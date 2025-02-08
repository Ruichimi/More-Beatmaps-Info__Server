const RamCacher = require("./RamCacher");
const FileCacher = require("./FileCacher");
const BeatmapsFilter = require('./BeatmapsFilter');

class CacheManager {
    constructor() {
        this.beatmapSetsCacheLimit = 300;
        this.beatmapSetsCacheCleanItems = 150;
        this.beatmapCacheLimit = 44;
        this.beatmapCacheCleanItems = 40;
    }

    getObjectFromCache(objectId, objectType) {
        const cachedObject = RamCacher.getObjectById(objectId, objectType);
        if (cachedObject) {
            //console.log(`The ${objectType} ${objectId} data received from RAM cache`);
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

    cacheObject(object, objectType, cacheLimit, cleanItems) {
        try {
            if (RamCacher[`${objectType}sCache`].size >= cacheLimit) {
                const clearedRamData = RamCacher.clearOldObjectsByDate(objectType, cleanItems);
                FileCacher.writeToFile(clearedRamData, objectType);
            }
            const objectId = String(object.id);
            object.date = Date.now();
            delete object.id;

            FileCacher.appendToFile({[objectId]: object}, objectType);
            RamCacher.setObject(object, objectId, cacheLimit, objectType);
        } catch(err) {
            throw new Error(`Failed to cache ${objectType} \n${err.message}`);
        }
    }

    loadObjectItemsToRamFromFile(dataType) {
        try {
            let cachedItemsCount = 0;
            const mapsetsFileCached = FileCacher.getEntireBeatmapsetsCache(dataType);

            for (const [key, mapset] of Object.entries(mapsetsFileCached)) {
                RamCacher.setObject(mapset, key, this.beatmapSetsCacheLimit, dataType);
                cachedItemsCount++;
            }
            console.log(`${cachedItemsCount} ${dataType}s загруженны в оперативную память`);
        } catch(err) {
            throw new Error(`Failed to load ${dataType} to RAM from file \n${err.message}`);
        }
    }

    getCacheSize(objectType, cacheType) {
        try {
            let parsedData = null;
            if (objectType === 'beatmapset') {
                if (cacheType === 'ram') {
                    parsedData = RamCacher.getObjectCacheObject('beatmapset');
                } else if (cacheType === 'file') {
                    parsedData = FileCacher.getEntireBeatmapsetsCache('beatmapset');
                } else {
                    console.log('Попытка получить неверный тип кеша, доступные типы: \'ram\' \'file\'');
                }
            } else if (objectType === 'beatmap') {
                console.log('beatmap');
                parsedData = RamCacher.getObjectCacheObject('beatmap');
            }

            if (typeof parsedData !== 'object' || parsedData === null) {
                console.log('Файл кэша содержит некорректные данные.');
                return {sizeInBytes: 0, numberOfEntries: 0};
            }
            const sizeInBytes = new TextEncoder().encode(JSON.stringify(parsedData)).length;
            const numberOfEntries = Object.keys(parsedData).length;

            return {sizeInBytes, numberOfEntries};
        } catch(err) {
            throw new Error(`Failed to get ${objectType}s cache size from ${cacheType} \n${err.message}`);
        }
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
