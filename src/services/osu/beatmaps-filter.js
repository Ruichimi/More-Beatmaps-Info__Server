const { AppError } = require('$/errors/AppError');

class BeatmapsFilter {
    roundBeatmapValues(beatmap) {
        try {
            if (!beatmap || typeof beatmap !== 'object') {
                throw new AppError('Invalid beatmap object', { code: 'INVALID_BEATMAP_OBJECT' })
            }

            for (let key in beatmap) {
                if (typeof beatmap[key] === 'number') {
                    beatmap[key] = parseFloat(beatmap[key].toFixed(2));
                } else if (typeof beatmap[key] === 'object' && beatmap[key] !== null) {
                    this.roundBeatmapValues(beatmap[key]);
                }
            }
            return beatmap;
        } catch (error) {
            throw new AppError(`Failed to filter beatmap`, {
                code: `BEATMAPS_FILTER_ERROR`, cause: error,
            });
        }
    }

    extractBeatmapCalcData(fullCalcObject) {
        try {
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
        } catch (error) {
            throw new AppError(`Failed to extract beatmap data`, {
                code: `BEATMAPS_FILTER_ERROR`, cause: error,
            });
        }
    }
}

module.exports = new BeatmapsFilter();
