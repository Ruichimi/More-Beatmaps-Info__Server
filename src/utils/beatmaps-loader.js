const mapsetsFacade = require('$/facades/mapsets.facade');

class BeatmapsLoader {
    constructor(requestsInMin) {
        this.requestsLimit = requestsInMin;
        this.requestsThisMinute = {
            count: 0,
            time: 0
        };

        this.scheduleRequestsReset();
    }

    scheduleRequestsReset() {
        setInterval(() => {
            this.requestsThisMinute.count = 0;
            this.requestsThisMinute.time = 0;
        }, 60000);

        setInterval(() => {
            this.requestsThisMinute.time++;
        }, 1000);
    }

    async waitForRequestsThisMinuteReset() {
        const waitMs = 60000 - (this.requestsThisMinute.time * 1000) + 200;
        console.log(`⌛ Waiting for rate limit reset in ${waitMs} ms...`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
    }

    async startFetching(amountToFetch, startId) {
        let fetchedCount = 0;

        while (fetchedCount < amountToFetch) {
            await this.fetchBeatmapset(startId);
            fetchedCount++;
            startId++;
        }

        console.log(`✅ Fetched ${fetchedCount} beatmaps, fetching complete.`);
    }

    async fetchBeatmapset(id) {
        if (this.requestsThisMinute.count >= this.requestsLimit) {
            await this.waitForRequestsThisMinuteReset();
        }

        this.requestsThisMinute.count++;
        const res = await mapsetsFacade.getMapsetData(id);
        console.log('🎵 Beatmap fetched:', id, res);
    }

}

module.exports = new BeatmapsLoader(250);
