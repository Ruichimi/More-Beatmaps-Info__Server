class BeatmapsFilter {
    constructor() {
        this.beatmapsetMinifizeKeysList = {
            "creator": "c",
            "status": "s",
            "title": "t",
            "bpm": "b",
            "date": "d",
            "beatmaps": [
                {
                    "difficulty_rating": "dr",
                    "id": "id",
                    "mode": "m",
                    "accuracy": "a",
                    "ar": "ar",
                    "bpm": "b",
                    "cs": "cs",
                    "drain": "d",
                    "max_combo": "mc"
                }
            ]
        };
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

    minimizeBeatmapset(beatmapsetData) {
        return this.processMinify(beatmapsetData);
    }

    reMinimizeBeatmapset(minimizedBeatmapsetData) {
        return this.processMinify(minimizedBeatmapsetData, true);
    }

    processMinify(beatmapsetObject, isMinimised = false) {
        for (let key in beatmapsetObject) {
            if (key !== 'beatmaps') {
                const targetKey = isMinimised
                    ? Object.keys(this.beatmapsetMinifizeKeysList).find(k => this.beatmapsetMinifizeKeysList[k] === key)
                    : this.beatmapsetMinifizeKeysList[key];

                if (targetKey && targetKey !== key) {
                    beatmapsetObject[targetKey] = beatmapsetObject[key];
                    delete beatmapsetObject[key];
                }
            }
        }
        if (beatmapsetObject.beatmaps) {
            beatmapsetObject.beatmaps.forEach((bmObject) => {
                for (let key in bmObject) {
                    const targetKey = isMinimised
                        ? Object.keys(this.beatmapsetMinifizeKeysList.beatmaps[0])
                            .find(k => this.beatmapsetMinifizeKeysList.beatmaps[0][k] === key)
                        : this.beatmapsetMinifizeKeysList.beatmaps[0][key];

                    if (targetKey && targetKey !== key) {
                        bmObject[targetKey] = bmObject[key];
                        delete bmObject[key];
                    }
                }
            });
        }
        return beatmapsetObject;
    }
}

module.exports = new BeatmapsFilter();
