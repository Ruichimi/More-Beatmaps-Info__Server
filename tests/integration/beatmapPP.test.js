const api = require('../helpers/api');
const axios = require("$/axios");
const AppError = require('$/errors/AppError');

let client;

beforeAll(async () => {
    client = await api();
});

describe('beatmapPP', () => {
    test('POST /api/BeatmapPP/:id works', async () => {
        const beatmapId = 5319044;
        const beatmapStructure = await getBeatmapStructure(beatmapId);

        const res = await client
            .post(`/api/BeatmapPP/${beatmapId}`)
            .send({
                beatmap: beatmapStructure
            });
        console.log(res.text);

        expect(res.statusCode).toBe(200);
    });
});

async function getBeatmapStructure(beatmapId) {
    const response = await axios.get(`https://osu.ppy.sh/osu/${beatmapId}`, {
        responseType: 'text',
    });

    if (response && response.data) {
        const beatmapStructure = response.data;
        if (beatmapStructure.length < 50 || typeof beatmapStructure !== 'string') {
            console.log(`Something went wrong, with beatmap structure: ${beatmapStructure.length}`);
            return;
        }
        return beatmapStructure;
    } else {
        throw new AppError('No response from osu api server', 502, 'TEST_ERROR');
    }
}
