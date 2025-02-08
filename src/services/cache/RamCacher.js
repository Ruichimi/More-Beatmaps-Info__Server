const BeatmapsFilter = require('../BeatmapsFilter');

class RamCacher {
    constructor() {
        this.beatmapsetsCache = new Map();
        this.beatmapsCache = new Map();
    }

    getObjectById(objectId, objectType) {
        try {
            const idString = String(objectId);
            const cache = this.getCacheByType(objectType);
            if (!cache.has(idString)) {
                //console.log(`The object with id ${idString} has not found`);
                return null;
            }

            const deepClonedData = JSON.parse(JSON.stringify(cache.get(idString)));
            let beatmapsetData = null;

            if (objectType === 'beatmap') {
                beatmapsetData = BeatmapsFilter.reMinimizeBeatmap(deepClonedData);
            } else if (objectType === 'beatmapset') {
                beatmapsetData = BeatmapsFilter.reMinimizeBeatmapset(deepClonedData);
            }

            return {...beatmapsetData, id: Number(objectId)};
        } catch(err) {
            throw new Error(`Failed to get ${objectType} from RAM cache, ${err.message}`);
        }

    }

    setObject(object, objectId, cacheLimit, objectType) {
        try {
            if (!object || typeof object !== 'object') {
                console.log('Неверные данные для загрузки.');
                return;
            }

            let cache = this.getCacheByType(objectType);
            if (objectType === 'beatmapset') {
                object = BeatmapsFilter.minimizeBeatmapset(object);
                object = BeatmapsFilter.removeUnusedFieldsFromBeatmapset(object);
            } else if (objectType === 'beatmap') {
                object = BeatmapsFilter.minimizeBeatmap(object);
            }

            if (cache.size >= cacheLimit) {
                console.log('Превышен лимит кэша, загрузка остановлена.');
                return cache.size;
            }
            cache.set(objectId, object);
            return cache.size;
        } catch (err) {
            throw new Error(`Failed to set object ${objectType} in RAM cache ${err.message}`);
        }
    }

    clearOldObjectsByDate(objectType, count) {
        try {
            const cache = this.getCacheByType(objectType);

            const sortedEntries = this.sortCacheByDate(cache);
            let deletedItemsCount = 0;
            console.log(sortedEntries.length);
            for (let i = 0; i < count && i < sortedEntries.length; i++) {
                const [key] = sortedEntries[i];
                cache.delete(key);
                deletedItemsCount++;
            }

            console.log(`Удалено ${deletedItemsCount} объектов из кэша "${objectType}"`);
            console.log(`Текущее количество элементов в кэше "${objectType}": ${cache.size}`);
            return Object.fromEntries(cache);
        } catch(err) {
            throw new Error(`Failed to clear ${objectType}s cache ${err.message}`);
        }
    }

    sortCacheByDate(cache) {
        return [...cache.entries()].sort((a, b) => {
            const dateA = new Date(a[1].date);
            const dateB = new Date(b[1].date);
            return dateA - dateB;
        });
    }

    getCacheByType(objectType) {
        if (objectType === 'beatmapset') {
            return this.beatmapsetsCache;
        } else if (objectType === 'beatmap') {
            return this.beatmapsCache;
        } else {
            throw new Error('Неверный тип объекта для кеша доступны: \'beatmapset\', \'beatmap\'');
        }
    }

    getObjectCacheObject(objectType) {
        return Object.fromEntries(this.getCacheByType(objectType));
    }
}

module.exports = new RamCacher();
