const beatmapsService = require('$/services/osu/beatmaps.service');
const CacheManager = require('$/infrastructure/cache-manager');
const cacheManager = new CacheManager();

exports.getBeatmapDataFromCache = async (beatmapId) => {
    return await cacheManager.getObject(beatmapId, 'beatmap');
}

exports.getBeatmapData = async (beatmapId, beatmapStructure) => {
    const cachedBeatmap = await cacheManager.getObject(beatmapId, 'beatmap');
    if (cachedBeatmap) return cachedBeatmap;

    const calculatedBeatmapData = beatmapsService.buildBeatmapData(beatmapId, beatmapStructure);
    console.log(calculatedBeatmapData);
    cacheManager.setBeatmap(calculatedBeatmapData);

    return calculatedBeatmapData;
}
