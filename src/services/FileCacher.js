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

    getCacheSize() {
        try {
            if (!fs.existsSync(this.beatmapsetsCacheFilePath)) {
                console.log('Файл кэша не найден.');
                return { sizeInBytes: 0, numberOfEntries: 0 };
            }
            const data = fs.readFileSync(this.beatmapsetsCacheFilePath, 'utf-8');
            const parsedData = JSON.parse(data);

            if (typeof parsedData !== 'object' || parsedData === null) {
                console.log('Файл кэша содержит некорректные данные.');
                return { sizeInBytes: 0, numberOfEntries: 0 };
            }

            const sizeInBytes = fs.statSync(this.beatmapsetsCacheFilePath).size;
            const numberOfEntries = Object.keys(parsedData).length;

            return { sizeInBytes, numberOfEntries };
        } catch (error) {
            throw new Error(`Не удалось получить размер кэша: ${error.message}`);
        }
    }
}

module.exports = new FileCacher();
