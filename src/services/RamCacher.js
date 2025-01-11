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

    loadBeatmapsetToRam(beatmapsetData, beatmapsetsCacheLimit) {
        if (!beatmapsetData || typeof beatmapsetData !== 'object') {
            console.log('Неверные данные для загрузки.');
            return;
        }

        if (this.beatmapsetsCache.size >= beatmapsetsCacheLimit) {
            console.log('Превышен лимит кэша, загрузка остановлена.');
            return this.beatmapsetsCache.size;
        }
        if (beatmapsetData.id) {
            this.beatmapsetsCache.set(String(beatmapsetData.id), beatmapsetData);
            console.log('Загрузили в кеш');
        } else {
            console.log('Отсутствует уникальный идентификатор для beatmapset.');
        }

        return this.beatmapsetsCache.size;
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
