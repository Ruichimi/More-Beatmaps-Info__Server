const rosu = require("rosu-pp-js");
const BeatmapsFilter = require("./beatmaps-filter");

exports.buildBeatmapData = (beatmapId, beatmapStructure) => {
    const calculatedBeatmapData = calculateBeatmapFromStructure(beatmapId, beatmapStructure);
    const beatmapData = BeatmapsFilter.extractBeatmapCalcData(calculatedBeatmapData);

    return BeatmapsFilter.roundBeatmapValues({
        ...beatmapData,
        id: Number(beatmapId),
    });
};

exports.buildRawBeatmapData = (beatmapId, beatmapStructure) => {
    let calculatedBeatmapData = calculateBeatmapFromStructure(beatmapId, beatmapStructure);
    return {
        ...serializeRawBeatmapData(calculatedBeatmapData),
        id: Number(beatmapId),
    };
}

const serializeRawBeatmapData = (calculatedBeatmapData) => {
    return calculatedBeatmapData.toJSON();
}

const calculateBeatmapFromStructure = (beatmapId, beatmapStructure) => {
    try {
        const map = new rosu.Beatmap(beatmapStructure);
        return new rosu.Performance({ mods: "CL" }).calculate(map);
    } catch (error) {
        throw new Error(`Failed to calculate data for beatmap ${beatmapId}`, { cause: error });
    }
}
