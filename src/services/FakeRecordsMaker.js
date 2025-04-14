const {faker} = require("@faker-js/faker");

class FakeRecordsMaker {
    async createFakeMapsetEntries(numEntries, maxObjectId, DBSet) {
        maxObjectId = Math.max(maxObjectId + 1, 3000000);

        for (let i = 0; i < numEntries; i++) {
            const mapsetId = (maxObjectId + i);
            const beatmaps = [];
            const numBeatmaps = Math.floor(Math.random() * 8) + 1;
            for (let j = 0; j < numBeatmaps; j++) {
                beatmaps.push({
                    difficulty_rating: parseFloat((Math.random() * 5).toFixed(2)),
                    id: 4955615 + j,
                    mode: ['taiko', 'mania', 'catch'][Math.floor(Math.random() * 3)],
                    accuracy: parseFloat((Math.random() * 10).toFixed(1)),
                    ar: Math.random() * 10,
                    bpm: Math.floor(Math.random() * 300),
                    cs: Math.random() * 10,
                    drain: Math.random() * 10,
                    max_combo: Math.floor(Math.random() * 1500),
                });
            }

            const mapsetData = {
                id: mapsetId,
                creator: faker.person.fullName(),
                status: ['ranked', 'pending', 'graveyard'][Math.floor(Math.random() * 3)],
                title: faker.lorem.words(2),
                bpm: Math.floor(Math.random() * 300),
                beatmaps: beatmaps,
            };

            await DBSet(mapsetId, mapsetData, Date.now(), 'beatmapset');

        }

        console.log(`Создано ${numEntries} фейковых записей для mapsets.`);
    }

    async createFakeBeatmapEntries(numEntries, maxObjectId, DBSet) {
        maxObjectId = Math.max(maxObjectId + 1, 10000000);
        for (let i = 0; i < numEntries; i++) {
            const beatmapId = (maxObjectId + i);
            const beatmapData = {
                difficulty: {
                    aim: parseFloat((Math.random() * 5).toFixed(2)),
                    speed: parseFloat((Math.random() * 5).toFixed(2)),
                    nCircles: Math.floor(Math.random() * 1000),
                    nSliders: Math.floor(Math.random() * 200),
                    speedNoteCount: parseFloat((Math.random() * 600).toFixed(2)),
                    flashlight: parseFloat((Math.random() * 5).toFixed(2)),
                }, id: beatmapId, pp: parseFloat((Math.random() * 500).toFixed(2)), date: Date.now(),
            };

            DBSet(beatmapId, beatmapData, Date.now(), 'beatmap');
        }

        console.log(`Создано ${numEntries} фейковых записей для beatmaps.`);
    }
}

module.exports = new FakeRecordsMaker();
