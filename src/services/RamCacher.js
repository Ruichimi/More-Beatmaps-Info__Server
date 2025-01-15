const BeatmapsFilter = require('./BeatmapsFilter');

class RamCacher {
    constructor() {
        this.beatmapsetsCache = new Map();
        this.beatmapsCache = new Map();
    }

    getBeatmapsetById(beatmapsetId) {
        const idString = String(beatmapsetId);
        if (this.beatmapsetsCache.has(idString)) {
            let beatmapsetData = BeatmapsFilter.reMinimizeBeatmapset(this.beatmapsetsCache.get(idString));
            return {...beatmapsetData, id: Number(beatmapsetId)};
        } else {
            return null;
        }
    }

    setBeatmapset(object, objectId, cacheLimit, objectType) {
        if (!object || typeof object !== 'object') {
            console.log('Неверные данные для загрузки.');
            return;
        }


        let beatmapsetData = object;
        let cache = null;
        if (objectType === 'beatmapset') {
            beatmapsetData = BeatmapsFilter.minimizeBeatmapset(beatmapsetData);
            beatmapsetData = BeatmapsFilter.removeUnusedFieldsFromBeatmapset(beatmapsetData);
            cache = this.beatmapsetsCache;
        } else if (objectType === 'beatmap') {
            //console.log(object);
            cache = this.beatmapsCache;
        } else {
            throw new Error('Неверный тип объекта для кеша доступны: \'beatmapset\', \'beatmap\'');
        }

        if (cache.size >= cacheLimit) {
            console.log('Превышен лимит кэша, загрузка остановлена.');
            return cache.size;
        }

        delete object.id;

        cache.set(objectId, beatmapsetData);
        return cache.size;
    }

    clearOldObjectsByDate(objectType, count) {
        let cache;
        if (objectType === 'beatmapsets') {
            cache = this.beatmapsetsCache;
        } else if (objectType === 'beatmaps') {
            cache = this.beatmapsCache;
        } else {
            throw new Error('Unknown objectType. Use "beatmapsets" or "beatmaps".');
        }

        const sortedEntries = [...cache.entries()].sort((a, b) => {
            const dateA = new Date(a[1].date);
            const dateB = new Date(b[1].date);
            return dateA - dateB;
        });

        let deletedItemsCount = 0;
        for (let i = 0; i < count && i < sortedEntries.length; i++) {
            const [key] = sortedEntries[i];
            cache.delete(key);
            deletedItemsCount++;
        }

        console.log(`Удалено ${deletedItemsCount} объектов из кэша "${objectType}"`);
        console.log(`Текущее количество элементов в кэше "${objectType}": ${cache.size}`);
        return Object.fromEntries(cache);
    }


    getBeatmapsetsCacheObject() {
        return Object.fromEntries(this.beatmapsetsCache);
    }
}

module.exports = new RamCacher();
