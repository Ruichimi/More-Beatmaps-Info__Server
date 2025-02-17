const RamCacher = require("./RamCacher");
const FileCacher = require("./FileCacher");
const BeatmapsFilter = require('../BeatmapsFilter');
const BeatmapsMinifier = require('../BeatmapsMinifier');

class CacheManager {
    constructor() {
        this.beatmapsetsCacheLimit = 30;
        this.beatmapsetsCacheCleanItems = 20;
        this.beatmapsCacheLimit = 3;
        this.beatmapsCacheCleanItems = 1;
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
        this.cacheObject(filteredMapset, 'beatmapset', this.beatmapsetsCacheLimit, this.beatmapsetsCacheCleanItems);
    }

    cacheBeatmap(beatmapData) {
        let filteredBeatmapData = BeatmapsFilter.filterBeatmap(beatmapData);
        this.cacheObject(filteredBeatmapData, 'beatmap', this.beatmapsCacheLimit, this.beatmapsCacheCleanItems);
    }

    cacheObject(object, objectType, cacheLimit, cleanItems) {
        try {
            // if (RamCacher[`${objectType}sCache`].size >= cacheLimit) {
            //     const clearedRamData = RamCacher.clearOldObjectsByDate(objectType, cleanItems);
            //     FileCacher.writeToFile(clearedRamData, objectType);
            // }
            this.cleanRamCacheIfNeeded(objectType);
            const objectId = String(object.id);
            object.date = Date.now();
            delete object.id;

            FileCacher.appendToFile({[objectId]: object}, objectType);
            RamCacher.setObject(object, objectId, cacheLimit, objectType);
        } catch(err) {
            throw new Error(`Failed to cache ${objectType} \n${err.message}`);
        }
    }

    cleanRamCacheIfNeeded(objectType, amount = null) {
        const cache = RamCacher[`${objectType}sCache`];
        const limit = this[`${objectType}sCacheLimit`];
        const cleanItems = amount ?? this[`${objectType}sCacheCleanItems`];

        if (amount && cache.size < amount) {
            throw new Error(`Failed to clean ram cache, amount smaller than items count ${cache.size}, ${amount}`);
        }

        if (amount || cache.size >= limit) {
            const clearedRamData = RamCacher.clearOldObjectsByDate(objectType, cleanItems);
            let reMinimizedData = null;
            let resultObject = {};

            for (let objectId in clearedRamData) {
                let value = clearedRamData[objectId];
                if (objectType === 'beatmapset') {
                    reMinimizedData = BeatmapsMinifier.reMinimizeBeatmapset(value);
                } else if (objectType === 'beatmap') {
                    reMinimizedData = BeatmapsMinifier.reMinimizeBeatmap(value);
                }
                resultObject[objectId] = reMinimizedData;
            }

            FileCacher.writeToFile(resultObject, objectType);
        }
    }


    loadObjectItemsToRamFromFile(dataType) {
        try {
            let cachedItemsCount = 0;
            const mapsetsFileCached = FileCacher.getEntireBeatmapsetsCache(dataType);

            for (const [key, mapset] of Object.entries(mapsetsFileCached)) {
                RamCacher.setObject(mapset, key, this.beatmapsetsCacheLimit, dataType);
                cachedItemsCount++;
            }
            console.log(`${cachedItemsCount} ${dataType}s загруженны в оперативную память`);
        } catch(err) {
            throw new Error(`Failed to load ${dataType} to RAM from file \n${err.message}`);
        }
    }

    getObjectSize(parsedData) {
        if (typeof parsedData !== 'object' || parsedData === null) {
            console.log('Файл кэша содержит некорректные данные.');
            return {sizeInBytes: 0, numberOfEntries: 0};
        }
        const sizeInBytes = new TextEncoder().encode(JSON.stringify(parsedData)).length;
        const numberOfEntries = Object.keys(parsedData).length;

        return {sizeInBytes, numberOfEntries};
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

            return this.getObjectSize(parsedData);
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
