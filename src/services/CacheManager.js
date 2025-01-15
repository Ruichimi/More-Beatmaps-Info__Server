const RamCacher = require("./RamCacher");
const FileCacher = require("./FileCacher");
const BeatmapsFilter = require('./BeatmapsFilter');

class CacheManager {
    constructor() {
        this.beatmapSetsCacheLimit = 1000;
        this.beatmapSetsCacheCleanItems = 500;
        this.beatmapCacheLimit = 5;
        this.beatmapCacheCleanItems = 3;
    }

    getBeatmapsetFromCache(beatmapsetId) {
        const cachedMapset = RamCacher.getBeatmapsetById(beatmapsetId);
        if (cachedMapset) {
            console.log(`The beatmapset ${beatmapsetId} data received from RAM cache`);
            return cachedMapset;
        }
    }

    cacheBeatmapset(mapsetData) {
        let filteredMapset = BeatmapsFilter.filterBeatmapset(mapsetData);
        if (RamCacher.beatmapsetsCache.size >= this.beatmapSetsCacheLimit) {
            const clearedRamData = RamCacher.clearOldObjectsByDate('beatmapsets', this.beatmapSetsCacheCleanItems);
            FileCacher.writeToFile(clearedRamData, 'beatmapset')
        }
        const mapsetId = filteredMapset.id;
        filteredMapset = { [mapsetId]: filteredMapset };

        FileCacher.appendToFile(filteredMapset, 'beatmapset');
        RamCacher.setBeatmapset(filteredMapset, mapsetId, this.beatmapSetsCacheLimit, 'beatmapset');
    }

    cacheBeatmap(beatmapData) {
        //if (RamCacher.beatmapsCache.size >= this.beatmapCacheLimit) {}
        console.log(RamCacher.beatmapsCache.size, this.beatmapCacheLimit);
        if (RamCacher.beatmapsCache.size >= this.beatmapCacheLimit) {
            console.log('Кеш карт переполнен очищаем');
            const clearedRamData = RamCacher.clearOldObjectsByDate('beatmaps', this.beatmapCacheCleanItems);
            FileCacher.writeToFile(clearedRamData, 'beatmaps')
        }
        beatmapData.date = Date.now();
        FileCacher.appendToFile(beatmapData, 'beatmap');
        RamCacher.setBeatmapset(beatmapData, this.beatmapCacheLimit, 'beatmap');
        console.log('Добавили подсчитаные данные карты в кеш');
    }

    loadObjectItemsToRamFromFile(dataType) {
        let cachedItemsCount = 0;
        const mapsetsFileCached = FileCacher.getEntireBeatmapsetsCache(dataType);

        for (const [key, mapset] of Object.entries(mapsetsFileCached)) {
            RamCacher.setBeatmapset(mapset, key, this.beatmapSetsCacheLimit, dataType);
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

    getBeatmapsetByIdCache(id, cacheType) {
        if (cacheType === 'ram') {
            return RamCacher.getBeatmapsetById(id);
        } else if (cacheType === 'file') {
            return FileCacher.getBeatmapsetFromCacheByKey(id);
        } else {
            console.log('Неверный тип кеша: cacheType, доступные типы: \'ram\' \'file\'');
        }
    }

    getEntireBeatmapsetCache() {
        return RamCacher.beatmapsetsCache;
    }
}

module.exports = CacheManager;
