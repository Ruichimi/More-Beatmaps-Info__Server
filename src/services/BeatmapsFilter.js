const { AppError } = require('$/errors/AppError');

class BeatmapsFilter {
    filter(object, objectType) {
        try {
            switch (objectType) {
                case 'beatmapset':
                    return this.filterBeatmapset(object);
                case 'beatmap':
                    return this.filterBeatmap(object);
                case 'calculatedBeatmapData':
                    return this.filterCalculatedBeatmapData(object);
                default:
                    throw new AppError(`Unknown object type: ${objectType}`, { code: 'UNKNOWN_OBJECT_TYPE' });
            }
        } catch (error) {
            throw new AppError(`Failed to filter ${objectType}: ${object?.id}`, {
                code: `BEATMAPS_FILTER_ERROR`, cause: error,
            });
        }

    }

    filterBeatmapset(rawObject) {
        const allowedFields = [
            'id', 'beatmaps', 'status', 'ranked_date', 'submitted_date', 'bpm', 'title', 'creator',
        ];
        const allowedFieldsBeatmap = [
            "accuracy", "ar", "bpm", "cs", "difficulty_rating", "drain", "id", "max_combo", "mode"
        ];

        const filteredObject = Object.fromEntries(
            Object.entries(rawObject).filter(([key]) => allowedFields.includes(key))
        );

        if (Array.isArray(filteredObject.beatmaps)) {
            filteredObject.beatmaps = filteredObject.beatmaps.map(beatmap =>
                Object.fromEntries(
                    Object.entries(beatmap)
                        .filter(([key]) => allowedFieldsBeatmap.includes(key))
                        .map(([key, value]) => {
                            if (key === 'difficulty_rating' && typeof value === 'number') {
                                return [key, Math.round(value * 100) / 100];
                            }
                            return [key, value];
                        })
                )
            );

            return this.filterBeatmapsetDate(filteredObject);
        }
    }

    filterBeatmap(beatmap) {
        if (!beatmap || typeof beatmap !== 'object') {
            throw new AppError('Invalid beatmap object', { code: 'INVALID_BEATMAP_OBJECT' })
        }

        for (let key in beatmap) {
            if (typeof beatmap[key] === 'number') {
                beatmap[key] = parseFloat(beatmap[key].toFixed(2));
            } else if (typeof beatmap[key] === 'object' && beatmap[key] !== null) {
                this.filterBeatmap(beatmap[key]);
            }
        }
        return beatmap;
    }

    filterBeatmapsetDate(beatmapsetData) {
        const date = beatmapsetData.ranked_date || beatmapsetData.submitted_date || new Date().toISOString();
        delete beatmapsetData.ranked_date;
        delete beatmapsetData.submitted_date;
        beatmapsetData.date = date;
        return beatmapsetData;
    }

    filterCalculatedBeatmapData(fullCalcObject) {
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
    }
}

module.exports = new BeatmapsFilter();
