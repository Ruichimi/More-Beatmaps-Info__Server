const axios = require("$/axios");
const rosu = require("rosu-pp-js");
const CacheManager = require("./cache/CacheManager");
const BeatmapsFilter = require('./BeatmapsFilter');

class OsuApiHelper extends CacheManager {
    constructor() {
        super();
        this.baseUrl = 'https://osu.ppy.sh/api/v2/';
        this.clientId = process.env.CLIENT_ID;
        this.clientSecret = process.env.CLIENT_SECRET;
        this.accessToken = null;
    }

    async init() {
        const response = await axios.post('https://osu.ppy.sh/oauth/token', `client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials&scope=public`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json',
            },
        });

        this.accessToken = response.data.access_token;
    }

    getMapsetData = async (mapsetId, measureTime = false) => {
        try {
            //await new Promise(resolve => setTimeout(resolve, 1000));
            const cachedBeatmapset = await this.getObject(mapsetId, 'beatmapset');
            if (cachedBeatmapset) {
                return cachedBeatmapset;
            }

            const startTime = measureTime ? performance.now() : null;

            const response = await axios.get(this.baseUrl + `beatmapsets/${mapsetId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (measureTime) {
                const endTime = performance.now();
                console.log(`Request ${mapsetId} took ${(endTime - startTime).toFixed(2)} ms`);
            }

            let filteredMapset = BeatmapsFilter.filterBeatmapset(response.data);
            this.setBeatmapset(filteredMapset);
            return filteredMapset;
        } catch (err) {
            console.error(err);
        }
    }


    async tryGetBeatmapDataFromCache(beatmapId) {
        return await this.getObject(beatmapId, 'beatmap');
    }

    async getBeatmapData(beatmapId, beatmapStructure) {
        try {
            const cachedBeatmap = await this.getObject(beatmapId, 'beatmap');
            if (cachedBeatmap) return cachedBeatmap;

            console.log("Getting pp for beatmap: ", beatmapId);
            const calculatedBeatmapData = this.#getCalculatedBeatmapData(beatmapId, beatmapStructure);
            const deepClonedData = JSON.parse(JSON.stringify(calculatedBeatmapData));

            this.setBeatmap(deepClonedData);
            return calculatedBeatmapData;
        } catch (error) {
            throw new Error(`Failed to calculate beatmap data: ${error}`);
        }
    }

    #getCalculatedBeatmapData(beatmapId, beatmapStructure) {
        try {
            const map = new rosu.Beatmap(beatmapStructure);
            const fullCalcBeatmapData = new rosu.Performance({mods: "CL"}).calculate(map);
            let filteredFullBeatmapData = BeatmapsFilter.filterCalculatedBeatmapData(fullCalcBeatmapData);
            return {...filteredFullBeatmapData, id: Number(beatmapId)};
        } catch(err) {
            throw new Error(`Не удалось высчитать данные для карты ${beatmapId}\n${err.message}`);
        }
    }
}

module.exports = new OsuApiHelper();
