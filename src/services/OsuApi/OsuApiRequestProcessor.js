const OsuApiRequestMaker = require('./OsuApiRequestMaker');
const osuApi = new OsuApiRequestMaker();

class OsuApiRequestProcessor {
    constructor() {
        this.readyToRequests = this.initOsuApi();
        this.showRequestsTime = false;

        this.rateLimitMin = 60;
        this.requestsThisMinute = 0;

        this.scheduleRequestsReset();
    }

    scheduleRequestsReset() {
        setInterval(() => {
            this.requestsThisMinute = 0;
        }, 60000);
    }

    async initOsuApi() {
        return osuApi.init().then(() => {
            console.log('Osu api processor initialized');
            this.readyToRequests = true;
        });
    }

    async getBeatmapset(mapsetId) {
        if (typeof mapsetId === 'string') {
            mapsetId = Number(mapsetId);
        }

        if (this.readyToRequests !== true) {
            await this.readyToRequests;
        }

        if (this.requestsThisMinute >= this.rateLimitMin) {
            throw new Error(`Too many request to osu api. Current limit is ${this.rateLimitMin} per minute`);
        }

        return await this.makeOsuApiMapsetRequest(mapsetId);
    }

    async makeOsuApiMapsetRequest(mapsetId) {
        let startTime;
        if (this.showRequestsTime) startTime = performance.now();

        this.requestsThisMinute++;

        const beatmapData = await osuApi.getBeatmapset(mapsetId);

        if (this.showRequestsTime) {
            const endTime = performance.now();
            console.log(`Время запроса beatmapset ${mapsetId}: ${(endTime - startTime).toFixed(2)} мс`);
        }

        return beatmapData;
    }
}

module.exports = OsuApiRequestProcessor;
