class RamCacher {
    constructor() {
        this.beatmapsetsCache = new Map();
        this.beatmapsCache = new Map();
    }

    getBeatmapsetById(beatmapsetId) {
        const id = String(beatmapsetId);
        if (this.beatmapsetsCache.has(id)) {
            return this.beatmapsetsCache.get(id);
        } else {
            return null;
        }
    }

    loadObjectToRam(object, cacheLimit, cacheDataType) {
        if (!object || typeof object !== 'object') {
            console.log('Неверные данные для загрузки.');
            return;
        }

        let cache = null;
        if (cacheDataType === 'beatmapset') {
            cache = this.beatmapsetsCache;
        } else if (cacheDataType === 'beatmap') {
            cache = this.beatmapsCache;
        } else {
            throw new Error('Неверный тип объекта для кеша доступны: \'beatmapset\', \'beatmap\'');
        }

        if (cache.size >= cacheLimit) {
            console.log('Превышен лимит кэша, загрузка остановлена.');
            return cache.size;
        }

        if (object.id) {
            cache.set(String(object.id), object);
            console.log(`Загрузили в кеш ${cacheDataType} c id: ${object.id}`);
        } else {
            console.log('Отсутствует уникальный идентификатор для beatmapset.');
        }

        return cache.size;
    }

    clearOldBeatmapsets(count) {
        const sortedEntries = [...this.beatmapsetsCache.entries()].sort((a, b) => {
            const dateA = new Date(a[1].date);
            const dateB = new Date(b[1].date);
            return dateA - dateB;
        });

        let deletedItemsCount = 0;

        for (let i = 0; i < count && i < sortedEntries.length; i++) {
            const [key] = sortedEntries[i];
            this.beatmapsetsCache.delete(key);
            deletedItemsCount++;
        }

        console.log(`Удаленно ${deletedItemsCount} карт из кэша`);
        console.log(`Текущее количество элементов в кэше: ${this.beatmapsetsCache.size}`);
        return Object.fromEntries(this.beatmapsetsCache);
    }

    getBeatmapsetsCacheObject() {
        return Object.fromEntries(this.beatmapsetsCache);
    }
}

module.exports = new RamCacher();
