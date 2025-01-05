const path = require("path");
const axios = require(path.resolve(__dirname, "./axios"));
const env = require(path.resolve(process.cwd(), './env.json'));
const rosu = require("rosu-pp-js");
const redis = require('redis');
const fs = require('fs');

// const redisClient = redis.createClient();
// redisClient.on('error', (err) => console.error('Ошибка Redis:', err));

class OsuApiHelper {
    constructor() {
        this.baseUrl = 'https://osu.ppy.sh/api/v2/';
        this.clientId = env.osuApi.clientId;
        this.clientSecret = env.osuApi.clientSecret;
        this.accessToken = null;
        this.beatmapsetsCacheFilePath = './beatmapsetsCache.json';
    }

    async init() {
        const response = await axios.post('https://osu.ppy.sh/oauth/token', `client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials&scope=public`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json',
            },
        });

        this.accessToken = response.data.access_token;
    }

    getMapsetData = async (mapsetId) => {
        const response = await axios.get(this.baseUrl + `beatmapsets/${mapsetId}`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const filteredData = this.filterBeatmapsetData(response.data);
        console.log(filteredData);
        return filteredData;
    }

    filterBeatmapsetData(rawObject) {
        const allowedFields = [
            'id', 'title', 'creator', 'beatmaps', 'status', 'ranked_date', 'submitted_date', 'bpm'
        ];
        const allowedFieldsBeatmap = [
            "accuracy", "ar", "bpm", "cs", "difficulty_rating", "drain", "id", "max_combo", "mode"
        ];

        const filteredObject = Object.fromEntries(
            Object.entries(rawObject).filter(([key]) => allowedFields.includes(key))
        );

        if (filteredObject.beatmaps && Array.isArray(filteredObject.beatmaps)) {
            filteredObject.beatmaps = filteredObject.beatmaps.map(beatmap =>
                Object.fromEntries(
                    Object.entries(beatmap).filter(([key]) => allowedFieldsBeatmap.includes(key))
                )
            );
        }
        this.appendToFile(filteredObject);
        return filteredObject;
    }

    async appendToFile(data) {
        let currentData = {};
        try {
            const rawData = fs.readFileSync(this.beatmapsetsCacheFilePath, 'utf8');
            currentData = JSON.parse(rawData);
        } catch (err) {
            console.log('Файл пуст или ошибка чтения:', err);
        }
        const newKey = `item_${data.id}`;
        currentData[newKey] = data;
        try {
            fs.writeFileSync(this.beatmapsetsCacheFilePath, JSON.stringify(currentData, null, 2), 'utf8');
        } catch (err) {
            console.error('Ошибка записи файла:', err);
        }
    }

    loadFromFile() {
        try {
            const rawData = fs.readFileSync(this.beatmapsetsCacheFilePath, 'utf8');
            return JSON.parse(rawData);
        } catch (err) {
            console.error('Ошибка при чтении файла:', err);
            return null;
        }
    }

    async getBeatmapData(beatmapId, beatmapStructure) {
        try {
            console.log("Getting pp for beatmap: ", beatmapId);
            const map = new rosu.Beatmap(beatmapStructure);
            const fullCalcBeatmapData = new rosu.Performance({mods: "CL"}).calculate(map);
            return this.filterCalculatedBeatmapData(fullCalcBeatmapData);
        } catch (error) {
            console.error("Ошибка получения данных:", error);
            throw new Error(`Failed to calculate beatmap data: ${error}`);
        }
    }

    filterCalculatedBeatmapData(fullCalcObject) {
        return {
            difficulty: {
                aim: fullCalcObject.difficulty?.aim,
                speed: fullCalcObject.difficulty?.speed,
                nCircles: fullCalcObject.difficulty?.nCircles,
                nSliders: fullCalcObject.difficulty?.nSliders,
                speedNoteCount: fullCalcObject.difficulty?.speedNoteCount,
                flashlight: fullCalcObject.difficulty?.flashlight,
            },
            pp: fullCalcObject.pp,
        };
    }
}

module.exports = new OsuApiHelper();
