const FileCacher = require("./DBCache");
const BeatmapsFilter = require('../BeatmapsFilter');
const dataBase = new FileCacher;
const fake = require('../FakeRecordsMaker.js');

class CacheManager {
    constructor() {
        // noinspection JSUnusedGlobalSymbols
        this.beatmapsetsCacheLimit = 300000;
        // noinspection JSUnusedGlobalSymbols
        this.beatmapsetsCacheCleanItems = 30000;
        // noinspection JSUnusedGlobalSymbols
        this.beatmapsCacheLimit = 30000;
        // noinspection JSUnusedGlobalSymbols
        this.beatmapsCacheCleanItems = 20000;
    }

    async getObject(objectId, objectType) {
        const cachedObject = await dataBase.getObjectById(objectId, objectType);
        if (cachedObject) {
            console.log(`The ${objectType} ${objectId} data received from cache`);
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
                this.cleanItemsAmount(objectType, this[`${objectType}sCacheCleanItems`]);
            }


            const objectId = String(object.id);
            object.date = Date.now();
            delete object.id;

            dataBase.setObject(objectId, object, objectType);
            //this.#setObjectRam(object, objectId, objectType);
        } catch(err) {
            throw new Error(`Failed to cache ${objectType} \n${err.message}`);
        }
    }

    async cleanItemsAmount(objectType, amount) {
        try {
            return await dataBase.clearOldEntries(objectType, amount);
        } catch(err) {
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
            console.log(`Не удалось получить карту из файла кеша ${err}`);
        }
    }

    async createFakeEntries(cacheType, amount) {
        amount = Number(amount);
        const tableName = dataBase.getTableNameByObjectType(cacheType);
        const maxObjectId = await dataBase.getMaxObjectId(tableName);

        const boundSetObject = dataBase.setObject.bind(dataBase);

        if (cacheType === 'beatmapset') {
            await fake.createFakeMapsetEntries(amount, maxObjectId, boundSetObject);
        } else if (cacheType === 'beatmap') {
            await fake.createFakeBeatmapEntries(amount, maxObjectId, boundSetObject);
        }
    }
}

module.exports = CacheManager;
