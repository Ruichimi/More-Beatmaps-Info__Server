const fs = require("fs");

class FileCacher {
    constructor() {
        this.beatmapsetsCacheFilePath = './beatmapsetsCache.json';
        this.beatmapsCacheFilePath = './beatmapsCache.json';
    }

    getEntireBeatmapsetsCache(objectType) {
        try {
            const path = this.getCachePath(objectType);
            if (!fs.existsSync(path)) {
                throw new Error(`Cache file not found: ${path}`);
            }

            const data = fs.readFileSync(path, 'utf-8') || '{}';
            const parsedData = JSON.parse(data)

            if (typeof parsedData !== 'object' || parsedData === null) {
                throw new Error(`Failed to parse data from ${path}, parsed data: \n
                ${JSON.stringify(parsedData, null, 2)}`);
            }
            return parsedData;
        } catch (error) {
            throw new Error(`Не удалось получить данные мапсета из файла кэша: ${error.message}`)
        }
    }

    writeToFile(data, objectType) {
        const path = this.getCachePath(objectType);
        try {
            fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
        } catch (err) {
            throw new Error(`Failed to write data to ${path}`);
        }
    }

    async appendToFile(object, objectType) {
        try {
            let currentData;
            const fileData = this.getFileData(objectType);
            if (!fileData) {
                currentData = {}
            } else {
                currentData = JSON.parse(fileData);
            }

            currentData = {...currentData, ...object};
            this.writeToFile(currentData, objectType);
        } catch (error) {
            throw new Error(`Failed to append ${objectType} data to file ${error.message}`);
        }
    }

    getFileData(objectType) {
        try {
            return fs.readFileSync(this.getCachePath(objectType), 'utf8');
        } catch (err) {
            console.log(`Error with getting file data \n ${err}`);
            return null;
        }
    }

    getCachePath(objectType) {
        if (objectType === 'beatmapset') return this.beatmapsetsCacheFilePath;
        if (objectType === 'beatmap') return this.beatmapsCacheFilePath;
        throw new Error(`File cacher error: unknown object type \'${objectType}\'`);
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
            throw new Error(`Failed to get beatmapset from file cache ${error.message}`);
        }
    }
}

module.exports = new FileCacher();
