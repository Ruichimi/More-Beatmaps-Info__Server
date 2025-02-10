class BeatmapsMinifier {
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
            let newSubObjectKey = null; // The key name to which the nested object's key will be renamed
            let originalSubObjectKey= null; // The original key name for the nested object, e.g. "beatmaps"
            // Minify the first top-level object
            Object.keys(beatmapsetObject).forEach((key) => {
                const value = beatmapsetObject[key];
                // Check if the value is a nested object or array
                if (!(typeof value === 'object' && value !== null)) {
                    this.#renameObjectKeyByListKeys(beatmapsetObject, key, value, objectListKeys, isMinimised);
                } else {
                    if (isMinimised) {
                        // If the object is already minimised, find the key name from minifizeKeysList based on the value and store it
                        newSubObjectKey = Object.keys(this.minifizeKeysList).find(k => this.minifizeKeysList[k] === key);
                        // In this case, the original key will be this value
                        originalSubObjectKey = newSubObjectKey;
                    } else {
                        // If the object is normal, just get the value from minifizeKeysList for renaming
                        newSubObjectKey = this.minifizeKeysList[key];
                        // The original key is simply taken from the source object
                        originalSubObjectKey = key;
                    }
                    // Rename the key for the nested object
                    beatmapsetObject[newSubObjectKey] = value;
                    delete beatmapsetObject[key];
                }
            });

            // Minify nested objects like beatmaps or difficulty, passing the obtained keys
            if (newSubObjectKey) {
                this.#renameSubObjectKeys(beatmapsetObject, newSubObjectKey, originalSubObjectKey, objectListKeys, isMinimised);
            } else {
                throw new Error(`Undefined key to rename sub object`);
            }

            return beatmapsetObject;
        } catch(err) {
            const actionText = isMinimised ? 'reMinify' : 'Minify';
            throw new Error(`Failed to ${actionText} object ${err.message}`);
        }
    }

    #renameSubObjectKeys(beatmapsetObject, newSubObjectKey, originalSubObjectKey, objectListKeys, isMinimised) {
        if (Array.isArray(beatmapsetObject[newSubObjectKey])) {
            beatmapsetObject[newSubObjectKey].forEach(item => {
                if (Array.isArray(item)) {
                    throw new Error(`Undefined sub object ${newSubObjectKey}`);
                }
                this.#renameKeys(item, objectListKeys[originalSubObjectKey], isMinimised);
            });
        } else if (beatmapsetObject[newSubObjectKey]) {
            this.#renameKeys(beatmapsetObject[newSubObjectKey], objectListKeys[originalSubObjectKey], isMinimised);
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
}

module.exports = new BeatmapsMinifier();
