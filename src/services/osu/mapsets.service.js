const RequestProcessor = require('$/integrations/osu/request-processor');
const mapper = require('$/integrations/osu/mapper');
const requestProcessor = new RequestProcessor();
const CacheManager = require('$/infrastructure/cache-manager');
const cacheManager = new CacheManager();
const { AppError } = require('$/errors/AppError');

const getMapsetData = async (mapsetId, { raw = false } = {}) => {
    const fetchedMapset = await requestProcessor.getBeatmapset(mapsetId);

    if (raw) {
        return fetchedMapset;
    }

    return mapper.mapMapset(fetchedMapset);
};

const removeBeatmapsFromCache = async (mapsetId) => {
    const mapsetData = await cacheManager.getObject(mapsetId, 'beatmapset');

    if (!mapsetData) {
        throw new AppError(`Failed to get mapset data with id ${mapsetId}`, { code: 'FAILED_UPDATE_MAPSET' });
    }

    if (mapsetData.beatmaps) {
        for (const beatmap of mapsetData.beatmaps) {
            await cacheManager.removeObjectById(beatmap.id, 'beatmaps');
        }
    }

    await cacheManager.removeObjectById(mapsetId, 'mapsets');
}

module.exports = {
    getMapsetData,
    removeBeatmapsFromCache,
}
