const fs = require("fs");

class FileCacher {
    constructor() {
        this.beatmapsetsCacheFilePath = './beatmapsetsCache.json';
    }

    /*
     * This function retrieves an object from the cache stored in a file.
     * It loads the entire file into memory (RAM) and then tries to find and return the object by the given key.
     * If the cache file doesn't exist or the object with the specified key is not found, an error message is logged.
     * Important: Since the data is loaded into RAM, using this function may lead to memory overload when dealing with large amounts of data.
     * This function is primarily intended for debugging purposes.
     */
    getObjectFromCache(key) {
        try {
            if (!fs.existsSync(this.beatmapsetsCacheFilePath)) {
                console.log('Файл кэша не найден.');
                return null;
            }

            const data = fs.readFileSync(this.beatmapsetsCacheFilePath, 'utf-8');
            const parsedData = JSON.parse(data);

            if (parsedData.hasOwnProperty(key)) {
                return parsedData[key];
            } else {
                console.log(`Объект с ключом ${key} не найден.`);
                return null;
            }
        } catch (error) {
            console.error(`Ошибка при получении объекта из кэша: ${error.message}`);
            return null;
        }
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
