const path = require("path");
const axios = require(path.resolve(__dirname, "./axios"));
const env = require(path.resolve(process.cwd(), './env.json'));
const rosu = require("rosu-pp-js");
const CacheManager = require("./CacheManager");

class OsuApiHelper extends CacheManager {
    constructor() {
        super();
        this.baseUrl = 'https://osu.ppy.sh/api/v2/';
        this.clientId = env.osuApi.clientId;
        this.clientSecret = env.osuApi.clientSecret;
        this.accessToken = null;
    }

    async init() {
        const response = await axios.post('https://osu.ppy.sh/oauth/token', `client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials&scope=public`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json',
            },
        });

        this.accessToken = response.data.access_token;
        this.loadObjectItemsToRamFromFile('beatmapset');
        this.loadObjectItemsToRamFromFile('beatmap');
    }

    getMapsetData = async (mapsetId) => {
        const cachedBeatmap = this.getBeatmapsetFromCache(mapsetId);
        if (cachedBeatmap) {
            return cachedBeatmap;
        }
        console.log('Карты в кеше нет, выдаём через апи');
        const response = await axios.get(this.baseUrl + `beatmapsets/${mapsetId}`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        this.cacheBeatmapset(response.data);

        return response.data;
    }

    async getBeatmapData(beatmapId, beatmapStructure) {
        try {
            console.log("Getting pp for beatmap: ", beatmapId);
            const map = new rosu.Beatmap(beatmapStructure);
            const fullCalcBeatmapData = new rosu.Performance({mods: "CL"}).calculate(map);
            let filteredFullBeatmapData =  this.filterCalculatedBeatmapData(fullCalcBeatmapData);
            filteredFullBeatmapData = {...filteredFullBeatmapData, id: beatmapId}
            this.cacheBeatmap(filteredFullBeatmapData);
            console.log(filteredFullBeatmapData);
            return filteredFullBeatmapData;
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
