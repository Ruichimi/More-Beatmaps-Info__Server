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

        this.minifizeKeysList = {
            difficulty: 'df',
            beatmaps: 'bm'
        }
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
        try {
            //Название на которое будет переименовован ключ для вложенного объекта
            //Устанавливается взависимости от того минифицированный объект приходит или нет
            let renameSubObjectKey = null;
            //Изначальное название ключа для вложенного объекта, к пример "beatmaps"
            //Необходимо для поиска под объекта в списке ключей для переименования
            //Устанавливается взависимости от того минифицированный объект приходит или нет
            let fullSubObjectKey= null;
            // Минимизируем первый верхний слой объекта
            Object.keys(beatmapsetObject).forEach((key) => {
                const value = beatmapsetObject[key];

                // Проверяем, является ли значение вложенным объектом или массивом
                if (typeof value === 'object' && value !== null) {
                    if (isMinimised) {
                        renameSubObjectKey = Object.keys(this.minifizeKeysList).find(k => this.minifizeKeysList[k] === key);
                        fullSubObjectKey = renameSubObjectKey;
                    } else {
                        fullSubObjectKey = key;
                        renameSubObjectKey = this.minifizeKeysList[key];
                    }
                    //console.log(renameSubObjectKey);
                    beatmapsetObject[renameSubObjectKey] = value;
                    delete beatmapsetObject[key];
                } else {
                    this.#renameObjectKeyByListKeys(beatmapsetObject, key, value, objectListKeys, isMinimised);
                }
            });

            // Минимизируем вложенные объекты beatmaps или difficulty
            if (renameSubObjectKey) {
                this.#renameSubObjectKeys(beatmapsetObject, renameSubObjectKey, fullSubObjectKey, objectListKeys, isMinimised);
            } else {
                throw new Error(`Undefined key to rename sub object`);
            }

            return beatmapsetObject;
        } catch(err) {
            const actionText = isMinimised ? 'reMinify' : 'Minify';
            throw new Error(`Failed to ${actionText} object ${err.message}`);
        }
    }

    #renameKeys(object, objectListKeys, isMinimised) {
        for (let [key, value] of Object.entries(object)) {
            this.#renameObjectKeyByListKeys(object, key, value, objectListKeys, isMinimised)
        }
    }

    #renameObjectKeyByListKeys(object, key, value, objectListKeys, isMinimised) {
        const targetKey = isMinimised
            ? Object.keys(objectListKeys).find(k => objectListKeys[k] === key)
            : objectListKeys[key];
        //console.log(targetKey);
        if (targetKey && targetKey !== key) {
            object[targetKey] = value;
            delete object[key];
        }
    }

    #renameSubObjectKeys(beatmapsetObject, renameSubObjectKey, fullSubObjectKey, objectListKeys, isMinimised) {
        if (Array.isArray(beatmapsetObject[renameSubObjectKey])) {
            beatmapsetObject[renameSubObjectKey].forEach(item => {
                if (Array.isArray(item)) {
                    throw new Error(`Undefined sub object ${renameSubObjectKey}`);
                }
                this.#renameKeys(item, objectListKeys[fullSubObjectKey], isMinimised);
            });
        } else if (beatmapsetObject[renameSubObjectKey]) {
            this.#renameKeys(beatmapsetObject[renameSubObjectKey], objectListKeys[fullSubObjectKey], isMinimised);
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
