class BeatmapsFilter {
    constructor() {
        this.beatmapsetMinifizeKeysList = {
            "creator": "c",
            "status": "s",
            "title": "t",
            "bpm": "b",
            "date": "d",
            "beatmaps":
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
        };

        this.beatmapMinifizeKeysList = {
            "difficulty": {
                "aim": "a",
                "speed": "s",
                "nCircles": "nc",
                "nSliders": "ns",
                "speedNoteCount": "sn",
                "flashlight": "f"
            },
            "pp": "p",
            "id": "i",
            "date": "t"
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
        return this.processMinify(beatmapsetData, this.beatmapsetMinifizeKeysList);
    }

    reMinimizeBeatmapset(minimizedBeatmapsetData) {
        return this.processMinify(minimizedBeatmapsetData, this.beatmapsetMinifizeKeysList, true);
    }

    minimizeBeatmap(beatmapData) {
        return this.processMinify(beatmapData, this.beatmapMinifizeKeysList);
    }

    reMinimizeBeatmap(minimizedBeatmapData) {
        return this.processMinify(minimizedBeatmapData, this.beatmapMinifizeKeysList, true);
    }

    processMinify(beatmapsetObject, objectListKeys, isMinimised = false) {
        let subObject = null;
        for (let key in beatmapsetObject) {
            if (key !== 'beatmaps' && key !== 'difficulty') {
                const targetKey = isMinimised
                    ? Object.keys(objectListKeys).find(k => objectListKeys[k] === key)
                    : objectListKeys[key];

                if (targetKey && targetKey !== key) {
                    beatmapsetObject[targetKey] = beatmapsetObject[key];
                    delete beatmapsetObject[key];
                }
            } else {
                subObject = key;
            }
        }

        const filterFunk = (bmObject) => {
            for (let key in bmObject) {
                const targetKey = isMinimised
                    ? Object.keys(objectListKeys[subObject])
                        .find(k => objectListKeys[subObject][k] === key)
                    : objectListKeys[subObject][key];

                if (targetKey && targetKey !== key) {
                    bmObject[targetKey] = bmObject[key];
                    delete bmObject[key];
                }
            }
        };

        if (beatmapsetObject[subObject]) {
            if (subObject === 'beatmaps') {
                //console.log('Фильтруем под-объект как массив');
                beatmapsetObject[subObject].forEach((bmObject) => {
                    filterFunk(bmObject);
                });
            } else if(subObject === 'difficulty') {
                //console.log('Фильтруем под-объект как объект');
                filterFunk(beatmapsetObject[subObject]);
            }
        }
        return beatmapsetObject;
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
