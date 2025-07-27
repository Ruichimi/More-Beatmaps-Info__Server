const OsuApiRequestMaker = require('./OsuApiRequestMaker');
const osuApi = new OsuApiRequestMaker();

/**
 * Handles rate-limited requests to the osu! API.
 * Manages a queue, enforces per-minute limits, and allows postponed retrying.
 *
 * I'm too lazy to bind it to the actual clock time — it's not that important for the osu! API.
 * But just in case, it might be better to initialize the class on a calendar minute switch.
 */
class OsuApiRequestProcessor {
    constructor() {
        this.initOsuApiInterval();

        this.logging = false;

        this.rateLimitMin = process.env.OSU_API_RATE_LIMIT_MIN;
        this.requestsThisMinute = 0;

        this.resetIsSoon = false;
        this.requestsInQueueCountLimitToPostpone = 30;

        this.requestQueue = new Set();
    }

    /**
     * Schedules periodic reset of the request counter.
     * Reset happens every 60 seconds with a warning flag after 50 seconds.
     */
    scheduleRequestsReset() {
        if (this._resetTimeout1) clearInterval(this._resetTimeout1);
        if (this._resetTimeout2) clearTimeout(this._resetTimeout2);

        this._resetTimeout1 = setInterval(() => {
            if (this.logging) console.log(`[${getTime()}] The reset will be soon`);
            this.resetIsSoon = true;

            this._resetTimeout2 = setTimeout(() => {
                if (this.logging) console.log(`[${getTime()}] Schedule requests reset`);
                this.requestsThisMinute = 0;
                this.resetIsSoon = false;

            }, 10000);
        }, 50000);
    }

    /**
     * Initializes the osu! API instance and resets it every 24 hours to keep the API key fresh.
     * @returns {Promise<void>}
     */
    async initOsuApiInterval() {
        this.initOsuApi();

        setInterval(() => {
            this.initOsuApi();
        }, 24 * 60 * 60 * 1000); // 24 hours
    }

    initOsuApi() {
        osuApi.init().then(() => {
            this.scheduleRequestsReset();
            console.log(`[${getTime()}] Osu api processor initialized`);
        });
    }

    /**
     * Gets beatmapset data from the osu! API.
     * Automatically waits if the API isn't initialized yet.
     * @param {number|string} mapsetId - The ID of the mapset to request
     * @returns {Promise<any>} - Beatmapset data
     */
    async getBeatmapset(mapsetId) {
        if (typeof mapsetId === 'string') {
            mapsetId = Number(mapsetId);
        }

        this.requestQueue.add(mapsetId);

        let result;
        try {
            result = await this.blockOrKeepRequest(mapsetId);
        } finally {
            this.requestQueue.delete(mapsetId);
        }

        return result;
    }

    /**
     * Handles rate limiting. Waits and retries if the request can be postponed.
     * @param {number} mapsetId - The ID of the mapset to request
     * @returns {Promise<any>}
     */
    async blockOrKeepRequest(mapsetId) {
        while (this.requestsThisMinute >= this.rateLimitMin) {
            if (this.isPostponeRequestConditionsKeep()) {
                await new Promise(resolve => setTimeout(resolve, 3000)); // 3s sleep
            } else {
                this.requestQueue.delete(mapsetId);
                throw new Error(`Too many requests to osu api. Current limit is ${this.rateLimitMin} per minute`);
            }
        }

        return await this.makeOsuApiMapsetRequest(mapsetId);
    }

    /**
     * Sends the actual request to the osu! API and logs request time if enabled.
     * @param {number} mapsetId - The ID of the mapset to request
     * @returns {Promise<any>}
     */
    async makeOsuApiMapsetRequest(mapsetId) {
        try {
            let startTime;
            if (this.logging) startTime = performance.now();

            this.requestsThisMinute++;

            const beatmapData = await osuApi.getBeatmapset(mapsetId);

            if (this.logging) {
                const endTime = performance.now();
                console.log(`Время запроса beatmapset ${mapsetId}: ${(endTime - startTime).toFixed(2)} мс`);
            }

            return beatmapData;
        } catch (error) {
            this.requestQueue.delete(mapsetId);
            throw error;
        }
    }

    /**
     * Checks if a request can be postponed based on the current queue size and reset timing.
     * @returns {boolean}
     */
    isPostponeRequestConditionsKeep() {
        const isQueueSizeBelowLimit = this.requestQueue.size < this.requestsInQueueCountLimitToPostpone;
        return isQueueSizeBelowLimit && this.resetIsSoon;
    }
}

module.exports = OsuApiRequestProcessor;
