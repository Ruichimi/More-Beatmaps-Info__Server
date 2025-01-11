const RamCacher = require("./RamCacher");
const FileCacher = require("./FileCacher");

class CacheManager {
    constructor() {
        this.beatmapSetsCacheLimit = 1000;
        this.beatmapSetsCacheCleanItems = 500;
        this.beatmapCacheLimit = 10000;
        this.beatmapCacheCleanItems = 5000;
    }

    getBeatmapsetFromCache(beatmapsetId) {
        const cachedMapset = RamCacher.getBeatmapsetById(beatmapsetId);
        if (cachedMapset) {
            console.log(`The beatmapset ${beatmapsetId} data received from RAM cache`);
            return cachedMapset;
        }
    }

    cacheBeatmapset(mapsetData) {
        if (RamCacher.beatmapsetsCache.size >= this.beatmapSetsCacheLimit) {
            const clearedRamData = RamCacher.clearOldBeatmapsets(this.beatmapSetsCacheCleanItems);
            FileCacher.writeToFile(clearedRamData)
        }
        RamCacher.loadBeatmapsetToRam(mapsetData);
        FileCacher.appendToFile(mapsetData);
    }

    loadBeatmapsetsItemsToRamFromFile() {
        const mapsetsFileCached = FileCacher.getEntireBeatmapsetsCache();

        for (const [, mapset] of Object.entries(mapsetsFileCached)) {
            RamCacher.loadBeatmapsetToRam(mapset, this.beatmapSetsCacheLimit);
        }
    }

    filterBeatmapsetData(rawObject) {
        const allowedFields = [
            'id', 'title', 'creator', 'beatmaps', 'status', 'ranked_date', 'submitted_date', 'bpm'
        ];
        const allowedFieldsBeatmap = [
            "accuracy", "ar", "bpm", "cs", "difficulty_rating", "drain", "id", "max_combo", "mode"
        ];

        const filteredObject = Object.fromEntries(
            Object.entries(rawObject).filter(([key]) => allowedFields.includes(key))
        );

        if (filteredObject.beatmaps && Array.isArray(filteredObject.beatmaps)) {
            filteredObject.beatmaps = filteredObject.beatmaps.map(beatmap =>
                Object.fromEntries(
                    Object.entries(beatmap).filter(([key]) => allowedFieldsBeatmap.includes(key))
                )
            );
        }
        return filteredObject;
    }

    filterBeatmapsetDate(beatmapsetData) {
        const date = beatmapsetData.ranked_date || beatmapsetData.submitted_date || new Date().toISOString();
        delete beatmapsetData.ranked_date;
        delete beatmapsetData.submitted_date;
        beatmapsetData.date = date;
        return beatmapsetData;
    }

    getCacheSize(cacheType) {
        let parsedData = null;
        if (cacheType === 'ram') {
            parsedData = RamCacher.getBeatmapsetsCacheObject();
        } else if (cacheType === 'file') {
            parsedData = FileCacher.getEntireBeatmapsetsCache();
        } else {
            console.log('Попытка получить неверный тип кеша, доступные типы: \'ram\' \'file\'');
        }

        if (typeof parsedData !== 'object' || parsedData === null) {
            console.log('Файл кэша содержит некорректные данные.');
            return { sizeInBytes: 0, numberOfEntries: 0 };
        }
        const sizeInBytes = new TextEncoder().encode(JSON.stringify(parsedData)).length;
        const numberOfEntries = Object.keys(parsedData).length;

        return { sizeInBytes, numberOfEntries };
    }

    getBeatmapsetByIdCache(id, cacheType) {
        if (cacheType === 'ram') {
           return RamCacher.getBeatmapsetById(id);
        } else if(cacheType === 'file') {
            return FileCacher.getObjectFromCache(id);
        } else {
            console.log('Неверный тип кеша: cacheType, доступные типы: \'ram\' \'file\'');
        }
    }
}

module.exports = CacheManager;
