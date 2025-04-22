const rosu = require("rosu-pp-js");
const OsuApiRequestProcessor = require("./OsuApiRequestProcessor");
const osuApi = new OsuApiRequestProcessor();
const CacheManager = require("../cache/CacheManager");
const BeatmapsFilter = require('../BeatmapsFilter');

class OsuApiHelper extends CacheManager {
    constructor() {
        super();
        this.clientId = process.env.CLIENT_ID;
        this.clientSecret = process.env.CLIENT_SECRET;
        this.accessToken = null;
    }

    getMapsetData = async (mapsetId) => {
        try {
            const cachedBeatmapset = await this.getObject(mapsetId, 'beatmapset');
            if (cachedBeatmapset) {
                return cachedBeatmapset;
            }

            const mapsetData = await osuApi.getBeatmapset(mapsetId);

            let filteredMapset = BeatmapsFilter.filterBeatmapset(mapsetData);
            //filteredMapset is a reference, so mutating it affects the returned value.
            this.setBeatmapset(filteredMapset);
            return filteredMapset;
        } catch (err) {
            console.error(err.message);
            return null;
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
