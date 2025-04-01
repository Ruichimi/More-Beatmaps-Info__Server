const FileCacher = require("./DBCacher");
const BeatmapsFilter = require('../BeatmapsFilter');
const dataBase = new FileCacher;
const fake = require('$/services/FakeRecordsMaker.js');

class CacheManager {
    constructor() {
        //An IDE may show these variables as unused due to indirect usage. Preventing via comments.
        //noinspection JSUnusedGlobalSymbols
        this.beatmapsetsCacheLimit = 10;
        //noinspection JSUnusedGlobalSymbols
        this.beatmapsetsCacheCleanItems = 5;
        //noinspection JSUnusedGlobalSymbols
        this.beatmapsCacheLimit = 30000;
        //noinspection JSUnusedGlobalSymbols
        this.beatmapsCacheCleanItems = 20000;
    }

    async getObject(objectId, objectType) {
        const cachedObject = await dataBase.getObjectById(objectId, objectType);
        if (cachedObject) {
            //console.log(`The ${objectType} ${objectId} data received from cache`);
            return {id: Number(objectId), ...cachedObject};
        }
    }

    setBeatmapset(mapsetData) {
        let filteredMapset = BeatmapsFilter.filterBeatmapset(mapsetData);
        this.#setObject(filteredMapset, 'beatmapset');
    }

    setBeatmap(beatmapData) {
        let filteredBeatmapData = BeatmapsFilter.filterBeatmap(beatmapData);
        this.#setObject(filteredBeatmapData, 'beatmap');
    }

    #setObject(object, objectType) {
        try {
            const objectSizeLimit = this[`${objectType}sCacheLimit`];

            if (objectSizeLimit >= dataBase.getObjectCount(objectType)) {
                this.cleanItemsAmount(objectType);
            }

            const objectId = String(object.id);
            delete object.id;

            dataBase.setObject(objectId, object,  Date.now(), objectType);
        } catch(err) {
            throw new Error(`Failed to cache ${objectType} \n${err.message}`);
        }
    }

    async cleanItemsAmount(objectType, amount = null) {
        try {
            amount = amount !== null ? Number(amount) : this[`${objectType}sCacheCleanItems`];
            if (isNaN(amount)) throw new Error('Invalid amount');
            return await dataBase.clearOldEntries(objectType, amount);
        } catch (err) {
            throw new Error(`Failed to clean ${objectType}s cache \n${err.message}`);
        }
    }

   /*
    * Next methods currently using only for commands for testing the cache
    */

    async getCacheSize(objectType) {
        try {
            return await dataBase.getTableStats(objectType);
        } catch(err) {
            throw new Error(`Failed to get ${objectType}s cache \n${err.message}`);
        }
    }

    getObjectByIdFromDB(id, objectType) {
        try {
            return dataBase.getObjectById(id, objectType);
        } catch (err) {
            throw new Error(`Не удалось получить карту из файла кеша\n${err.message}`);
        }
    }

    async createFakeEntries(cacheType, amount) {
        try {
            amount = Number(amount);
            const tableName = dataBase.getTableNameByObjectType(cacheType);
            const maxObjectId = await dataBase.getMaxObjectId(tableName);

            const boundSetObject = dataBase.setObject.bind(dataBase);

            if (cacheType === 'beatmapset') {
                await fake.createFakeMapsetEntries(amount, maxObjectId, boundSetObject);
            } else if (cacheType === 'beatmap') {
                await fake.createFakeBeatmapEntries(amount, maxObjectId, boundSetObject);
            }
        } catch(err) {
            throw new Error(`Failed to create fake entries for ${cacheType}\n${err.message}`);
        }
    }
}

module.exports = CacheManager;
