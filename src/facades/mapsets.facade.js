const mapsetsService = require('$/services/osu/mapsets.service');
const { findErrorInCauseChain } = require('$/errors/AppError');
const CacheManager = require('$/infrastructure/cache-manager');
const cacheManager = new CacheManager();

const saveInCacheEmptyMapsets = true;

const getMapsetData = async (mapsetId) => {
    try {
        const cachedMapsetData = await cacheManager.getObject(mapsetId, 'beatmapset');
        if (cachedMapsetData) {
            return cachedMapsetData;
        }

        const mapsetData = await mapsetsService.getMapsetData(mapsetId);
        cacheManager.setBeatmapset(mapsetData);

        return mapsetData;
    } catch (error) {
        if (findErrorInCauseChain(error)?.code === 'BEATMAPSET_NOT_FOUND') {
            if (saveInCacheEmptyMapsets) {
                await cacheManager.registerEmptyBeatmapset(mapsetId);
                console.warn(`Required beatmapset ${mapsetId} does not exist.`);
                return null;
            }
        }

        throw error;
    }
}

updateMapset = async (mapsetId) => {
   await mapsetsService.removeBeatmapsFromCache(mapsetId);
   return await getMapsetData(mapsetId);
}

module.exports = {
    getMapsetData,
    updateMapset,
}
