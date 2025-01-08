class RamCacher {
    constructor() {
        this.beatmapsetsCache = new Map();
        this.beatmapCache = new Map();
        this.beatmapsetsCacheCount = 0;
        this.beatmapsCacheCount = 0;
    }

    getBeatmapsetById(beatmapsetId) {
        const id = String(beatmapsetId);
        if (this.beatmapsetsCache.has(id)) {
            return this.beatmapsetsCache.get(id);
        } else {
            //console.log(`Beatmapset с ID ${id} не найден.`);
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
            this.beatmapsetsCacheCount++;
            console.log(`Добавлен новый beatmapset в кэш. Текущее количество элементов: ${this.beatmapsetsCacheCount}`);
        } else {
            console.log('Отсутствует уникальный идентификатор для beatmapset.');
        }
        return this.beatmapsetsCache.size;
    }

    clearBeatmapsetsCache() {
        this.beatmapsetsCache.clear();
    }

    clearOldBeatmapsets(count) {
        if (count <= 0) {
            console.log('Указано некорректное количество для удаления.');
            return;
        }

        // Получаем массив объектов с ключами и значениями, отсортированных по дате
        const sortedEntries = [...this.beatmapsetsCache.entries()].sort((a, b) => {
            const dateA = new Date(a[1].date);
            const dateB = new Date(b[1].date);
            return dateA - dateB;
        });

        let deletedItemsCount = 0;

        // Удаляем самые старые элементы
        for (let i = 0; i < count && i < sortedEntries.length; i++) {
            const [key] = sortedEntries[i];
            this.beatmapsetsCache.delete(key);
            this.beatmapsetsCacheCount--;
            deletedItemsCount++;
        }

        console.log(`Текущее количество элементов в кэше: ${this.beatmapsetsCache.size}`);
        console.log(`Удаленно ${deletedItemsCount} карт из кэша`);
        return Object.fromEntries(this.beatmapsetsCache);
    }
}

module.exports = new RamCacher();
