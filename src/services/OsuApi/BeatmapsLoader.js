const OsuApi = require('$/services/OsuApi/OsuApiHelper');

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
        console.log(`⌛ Ожидаем сброс лимита через ${waitMs}мс`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
    }

    async startFetching(amountToFetch, startId) {
        let fetchedCount = 0;

        while (fetchedCount < amountToFetch) {
            await this.fetchBeatmapset(startId);
            fetchedCount++;
            startId++;
        }

        console.log(`✅ Получено ${fetchedCount} карт, фетчинг завершён.`);
    }

    async fetchBeatmapset(id) {
        const cachedId = await OsuApi.getObject(id, 'beatmapset');

        if (!cachedId) {
            if (this.requestsThisMinute.count >= this.requestsLimit) {
                await this.waitForRequestsThisMinuteReset();
            }

            this.requestsThisMinute.count++;
            const res = await OsuApi.getMapsetData(id, true);
            console.log('🎵 Получена карта', id, res);
        }
    }
}

module.exports = new BeatmapsLoader(250);
