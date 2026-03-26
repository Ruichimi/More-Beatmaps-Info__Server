const api = require('../helpers/api');
const axios = require("$/axios");
const { AppError } = require('$/errors/AppError');

let client;
const testBeatmapId = 5319044;

beforeAll(async () => {
    process.env.ENABLE_CACHE = '0';
    client = await api();
});

describe('beatmapPP', () => {
    test('returns 200 with valid beatmap structure', async () => {
        const beatmapStructure = await getBeatmapStructure(testBeatmapId);
        const res = await client
            .post(`/api/BeatmapPP/${testBeatmapId}`)
            .send({
                beatmap: beatmapStructure
            });

        expect(res.statusCode).toBe(200);
    });

    test('returns 400 for invalid beatmap structure', async () => {
        const res = await client
            .post(`/api/BeatmapPP/${testBeatmapId}`)
            .send({
                beatmap: `${'*'.repeat(50)}`
            });

        expect(res.statusCode).toBe(400);
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
        throw new AppError('No response from osu api server', { code: 'TEST_ERROR' });
    }
}
