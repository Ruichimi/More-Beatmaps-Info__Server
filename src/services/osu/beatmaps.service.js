const rosu = require("rosu-pp-js");
const BeatmapsFilter = require("./beatmaps-filter");

exports.buildBeatmapData = (beatmapId, beatmapStructure) => {
    const calculatedBeatmapData = calculateBeatmapFromStructure(beatmapId, beatmapStructure);
    let filteredFullBeatmapData =
        BeatmapsFilter.extractBeatmapCalcData(calculatedBeatmapData);

    const result = { ...filteredFullBeatmapData, id: Number(beatmapId) };

    return BeatmapsFilter.roundBeatmapValues(result);
}

const calculateBeatmapFromStructure = (beatmapId, beatmapStructure) => {
    try {
        const map = new rosu.Beatmap(beatmapStructure);
        return new rosu.Performance({ mods: "CL" }).calculate(map);
    } catch (error) {
        throw new Error(`Failed to calculate data for beatmap ${beatmapId}`, { cause: error });
    }
}
