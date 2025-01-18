const BeatmapsFilter = require('./BeatmapsFilter');

class RamCacher {
    constructor() {
        this.beatmapsetsCache = new Map();
        this.beatmapsCache = new Map();
    }

    getObjectById(objectId, objectType) {
        const idString = String(objectId);

        if (objectType === 'beatmap') {
            if (this.beatmapsCache.has(idString)) {
                console.log('Карта найдена в кеше');
                const deepClonedData = JSON.parse(JSON.stringify(this.beatmapsCache.get(idString)));
                let beatmapData = BeatmapsFilter.reMinimizeBeatmap(deepClonedData);

                return {...beatmapData, id: Number(objectId)};
            }
        } else if(objectType === 'beatmapset') {
            if (this.beatmapsetsCache.has(idString)) {
                const deepClonedData = JSON.parse(JSON.stringify(this.beatmapsetsCache.get(idString)));
                let beatmapsetData = BeatmapsFilter.reMinimizeBeatmapset(deepClonedData);
                console.log(beatmapsetData);
                console.log(beatmapsetData);
                return {...beatmapsetData, id: Number(objectId)};
            }
        } else {
            console.log(`Не удалось получить ${objectType} из RAM кеша, не верный тип. Доступные типы beatmap, beatmapset`);
        }
        return null;
    }

    setObject(object, objectId, cacheLimit, objectType) {
        if (!object || typeof object !== 'object') {
            console.log('Неверные данные для загрузки.');
            return;
        }

        let cache = null;
        if (objectType === 'beatmapset') {
            object = BeatmapsFilter.minimizeBeatmapset(object);
            object = BeatmapsFilter.removeUnusedFieldsFromBeatmapset(object);
            cache = this.beatmapsetsCache;
        } else if (objectType === 'beatmap') {
            object = BeatmapsFilter.minimizeBeatmap(object);

            cache = this.beatmapsCache;
        } else {
            throw new Error('Неверный тип объекта для кеша доступны: \'beatmapset\', \'beatmap\'');
        }

        if (cache.size >= cacheLimit) {
            console.log('Превышен лимит кэша, загрузка остановлена.');
            return cache.size;
        }
        cache.set(objectId, object);
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
