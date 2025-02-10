class BeatmapsFilter {
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

        if (filteredObject.beatmaps && Array.isArray(filteredObject.beatmaps)) {
            filteredObject.beatmaps = filteredObject.beatmaps.map(beatmap =>
                Object.fromEntries(
                    Object.entries(beatmap).filter(([key]) => allowedFieldsBeatmap.includes(key))
                )
            );
        }
        return this.filterBeatmapsetDate(filteredObject);
    }

    removeUnusedFieldsFromBeatmapset(beatmapsetObject) {
        delete beatmapsetObject.creator;
        delete beatmapsetObject.title;

        return beatmapsetObject;
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

    filterBeatmap(beatmap) {
        for (let key in beatmap) {
            if (typeof beatmap[key] === 'number') {
                beatmap[key] = parseFloat(beatmap[key].toFixed(2));
            } else if (typeof beatmap[key] === 'object' && beatmap[key] !== null) {
                this.filterBeatmap(beatmap[key]);
            }
        }
        return beatmap;
    }
}

module.exports = new BeatmapsFilter();
