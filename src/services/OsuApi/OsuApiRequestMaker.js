const axios = require("$/axios");

class OsuApiRequestMaker {
    constructor() {
        this.clientId = process.env.CLIENT_ID;
        this.clientSecret = process.env.CLIENT_SECRET;

        this.baseUrl = 'https://osu.ppy.sh/api/v2/';
        this.accessToken = null;
    }

    async init() {
        this.accessToken = await this.getAccessToken(this.clientId, this.clientSecret);
    }

    async getAccessToken(clientId, clientSecret) {
        const response = await axios.post('https://osu.ppy.sh/oauth/token', `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials&scope=public`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json',
            },
        });

        return response.data.access_token;
    }

    async getBeatmapset(mapsetId, measureTime = false) {
        try {
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

            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(String(error.response.status));
            } else {
                throw new Error(`Failed to fetch mapset data from osu api server:\n${error.message}`);
            }
        }
    }
}

module.exports = OsuApiRequestMaker;
