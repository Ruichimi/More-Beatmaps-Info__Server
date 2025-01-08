const RamCacher = require("./RamCacher");
const FileCacher = require("./FileCacher");

class CacheManager {
    constructor() {
        this.beatmapSetsCacheLimit = 100;
        this.beatmapSetsCacheCleanItems = 50;
        this.beatmapCacheLimit = 10000;
        this.beatmapCacheCleanItems = 5000;
    }

    getBeatmapsetFromCache(beatmapsetId) {
        const cachedMapset = RamCacher.getBeatmapsetById(beatmapsetId);
        if (cachedMapset) {
            console.log('Received mapsetData from RAM cache');
            return cachedMapset;
        }
    }

    cacheBeatmapset(mapsetData) {
        if (RamCacher.beatmapsetsCacheCount >= this.beatmapSetsCacheLimit) {
            const clearedRamData = RamCacher.clearOldBeatmapsets(this.beatmapSetsCacheCleanItems);
            FileCacher.writeToFile(clearedRamData)
        }
        RamCacher.loadBeatmapsetToRam(mapsetData);
        FileCacher.appendToFile(mapsetData);
    }

    loadBeatmapsetsItemsToRamFromFile() {
        const mapsetsFileCached = FileCacher.getEntireBeatmapsetsCache();

        for (const [key, mapset] of Object.entries(mapsetsFileCached)) {
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
}

module.exports = new CacheManager();
