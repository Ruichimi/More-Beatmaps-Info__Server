const rosu = require("rosu-pp-js");
const OsuApiRequestProcessor = require("./OsuApiRequestProcessor");
const osuApi = new OsuApiRequestProcessor();
const CacheManager = require("../cache/CacheManager");
const BeatmapsFilter = require('../BeatmapsFilter');
const { AppError, findAppErrorInCauseChain } = require('$/errors/AppError');

class OsuApiHelper extends CacheManager {
    constructor() {
        super();
        this.clientId = process.env.CLIENT_ID;
        this.clientSecret = process.env.CLIENT_SECRET;
        this.accessToken = null;
    }

    getMapsetData = async (mapsetId, registerInBDIf404 = false) => {
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
        } catch (error) {
            if (findAppErrorInCauseChain(error)?.code === 'BEATMAPSET_NOT_FOUND') {
                if (registerInBDIf404) {
                    this.registerEmptyBeatmapset(mapsetId);
                    console.warn(`Required beatmapset ${mapsetId} does not exist.`);
                }
            }

            throw error;
        }
    }

    async tryGetBeatmapDataFromCache(beatmapId) {
        return await this.getObject(beatmapId, 'beatmap');
    }

    async getBeatmapData(beatmapId, beatmapStructure) {
        if (!beatmapStructure.includes?.("[General]")) {
            throw new AppError('Invalid beatmap structure', 400, 'INVALID_BEATMAP_STRUCTURE');
        }
        const cachedBeatmap = await this.getObject(beatmapId, 'beatmap');
        if (cachedBeatmap) return cachedBeatmap;

        const calculatedBeatmapData = this.#getCalculatedBeatmapData(beatmapId, beatmapStructure);
        const deepClonedData = JSON.parse(JSON.stringify(calculatedBeatmapData));

        this.setBeatmap(deepClonedData);
        return calculatedBeatmapData;
    }

    #getCalculatedBeatmapData(beatmapId, beatmapStructure) {
        try {
            const map = new rosu.Beatmap(beatmapStructure);
            const fullCalcBeatmapData = new rosu.Performance({mods: "CL"}).calculate(map);
            let filteredFullBeatmapData = BeatmapsFilter.filterCalculatedBeatmapData(fullCalcBeatmapData);
            return {...filteredFullBeatmapData, id: Number(beatmapId)};
        } catch (error) {
            throw new Error(`Failed to calculate data for beatmap ${beatmapId}`, { cause: error });
        }
    }
}

module.exports = new OsuApiHelper();
