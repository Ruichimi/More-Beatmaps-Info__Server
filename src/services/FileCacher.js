const fs = require("fs");

class FileCacher {
    constructor() {
        this.beatmapsetsCacheFilePath = './beatmapsetsCache.json';
    }

    getEntireBeatmapsetsCache() {
        try {
            if (!fs.existsSync(this.beatmapsetsCacheFilePath)) {
                console.log('Файл кэша не найден.');
                return;
            }
            const data = fs.readFileSync(this.beatmapsetsCacheFilePath, 'utf-8');
            const parsedData = JSON.parse(data);

            if (typeof parsedData !== 'object' || parsedData === null) {
                console.log('Файл кэша содержит некорректные данные.');
                return;
            }
            return parsedData;
        } catch (error) {
            throw new Error(`Не удалось получить данные мапсета из файла кэша: ${error.message}`)
        }
    }

    removeOldestItemsFromObject(cleanItemsCount) {
        let cache = new Map();

        // Загрузка данных из файла
        if (fs.existsSync(this.beatmapsetsCacheFilePath)) {
            const fileData = fs.readFileSync(this.beatmapsetsCacheFilePath, 'utf8');
            try {
                const parsedData = JSON.parse(fileData);

                // Проверка структуры данных
                if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
                    // Преобразование объекта в массив пар [ключ, значение]
                    cache = new Map(Object.entries(parsedData));
                } else {
                    console.warn('Файл кэша содержит некорректные данные. Создается новый пустой кэш.');
                }
            } catch (error) {
                console.error('Ошибка чтения или парсинга файла кэша:', error);
                return;
            }
        } else {
            console.warn('Файл кэша не найден. Создается новый пустой кэш.');
        }

        // Получение всех записей из кэша и сортировка по дате
        const entries = Array.from(cache.entries());
        entries.sort((a, b) => {
            const dateA = new Date(a[1].date);
            const dateB = new Date(b[1].date);
            return dateA - dateB;
        });

        // Удаление старых элементов
        const itemsToDelete = entries.slice(0, entries.length - cleanItemsCount);
        itemsToDelete.forEach(([key]) => {
            cache.delete(key);
        });

        console.log(`Удалено ${itemsToDelete.length} старых элементов из кэша. Текущее количество элементов: ${cache.size}`);

        // Сохранение обновленного кэша обратно в файл
        fs.writeFileSync(this.beatmapsetsCacheFilePath, JSON.stringify(Object.fromEntries(cache)), 'utf8');
    }

    writeToFile(data) {
        fs.writeFileSync(this.beatmapsetsCacheFilePath, JSON.stringify(data, null, 2), 'utf8');
    }

    async appendToFile(data) {
        let currentData = {};
        try {
            const rawData = fs.readFileSync(this.beatmapsetsCacheFilePath, 'utf8');
            currentData = JSON.parse(rawData);
        } catch (err) {
            console.log('Файл пуст или ошибка чтения:', err);
        }
        const newKey = data.id;
        currentData[newKey] = data;
        try {
            fs.writeFileSync(this.beatmapsetsCacheFilePath, JSON.stringify(currentData, null, 2), 'utf8');
        } catch (err) {
            console.error('Ошибка записи файла:', err);
        }
    }
}

module.exports = new FileCacher();
