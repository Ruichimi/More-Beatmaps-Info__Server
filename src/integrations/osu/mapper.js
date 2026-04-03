const mapMapset = (rawObject) => {
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

        return filterBeatmapsetDate(filteredObject);
    }
}

const filterBeatmapsetDate = (beatmapsetData) => {
    const date = beatmapsetData.ranked_date || beatmapsetData.submitted_date || new Date().toISOString();
    delete beatmapsetData.ranked_date;
    delete beatmapsetData.submitted_date;
    beatmapsetData.date = date;
    return beatmapsetData;
}

module.exports = {
    mapMapset
};
