const fs = require("fs");

class FileCacher {
    constructor() {
        this.beatmapsetsCacheFilePath = './beatmapsetsCache.json';
        this.beatmapsCacheFilePath = './beatmapsCache.json';
    }

    /*
     * This function retrieves an object from the cache stored in a file.
     * It loads the entire file into memory (RAM) and then tries to find and return the object by the given key.
     * If the cache file doesn't exist or the object with the specified key is not found, an error message is logged.
     * Important: Since the data is loaded into RAM, using this function may lead to memory overload when dealing with large amounts of data.
     * This function is primarily intended for debugging purposes.
     */
    getBeatmapsetFromCacheByKey(key) {
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

    getEntireBeatmapsetsCache(objectType) {
        let path;
        if (objectType === 'beatmapset') {
            path = this.beatmapsetsCacheFilePath;
        } else if (objectType === 'beatmap') {
            path = this.beatmapsCacheFilePath;
        }
        try {
            if (!fs.existsSync(path)) {
                console.log('Файл кэша не найден.');
                return;
            }
            const data = fs.readFileSync(path, 'utf-8');
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

    writeToFile(data, objectType) {
        let path = null;
        if (objectType === 'beatmapset') {
            path = this.beatmapsetsCacheFilePath
        } else if (objectType === 'beatmap') {
            path = this.beatmapsCacheFilePath
        }
        try {
            fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
        } catch (err) {
            console.error('Ошибка записи файла:', err);
        }
    }

    async appendToFile(data, objectType) {
        let currentData;
        let fileData = null;
        try {
            if (objectType === 'beatmapset') {
                fileData = fs.readFileSync(this.beatmapsetsCacheFilePath, 'utf8');
            } else if (objectType === 'beatmap') {
                try {
                    fileData = fs.readFileSync(this.beatmapsCacheFilePath, 'utf8');
                } catch (err) {
                    fileData = null;
                }
            }
        } catch (err) {
            console.log('Файл пуст или ошибка чтения:', err);
        }
        if (!fileData) {
            currentData = {}
        } else {
            currentData = JSON.parse(fileData);
        }

        // const newData = {...data, date: Date.now()}
        currentData = { ...currentData, ...data };

        this.writeToFile(currentData, objectType);
    }
}

module.exports = new FileCacher();
