const axios = require("$/axios");
const AppError = require('$/errors/AppError');

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
        try {
            const response = await axios.post(
                'https://osu.ppy.sh/oauth/token',
                `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials&scope=public`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                    },
                }
            );

            return response.data.access_token;

        } catch (error) {
            this.apiErrorHandler(error);
        }
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
            this.apiErrorHandler(error);
        }
    }

    apiErrorHandler(error) {
        if (error.response) {
            const status = error.response.status;
            if (status === 404) {
                throw new AppError(
                    "Unexisting beatmapset",
                    status,
                    "BEATMAPSET_NOT_FOUND",
                    error.response.data
                );
            }

            throw new AppError(
                `osu api error: ${error.message}`,
                status,
                "OSU_API_ERROR",
                error.response.data
            );
        }

        if (error.request) {
            throw new AppError(
                "No response from osu api server",
                503,
                "OSU_API_NO_RESPONSE"
            );
        }

        throw error;
    }
}

module.exports = OsuApiRequestMaker;
