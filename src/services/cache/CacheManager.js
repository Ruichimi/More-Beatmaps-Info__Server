const BeatmapsFilter = require('../BeatmapsFilter');
const dataBase = require("./DBCacher");
const fake = require('$/services/FakeRecordsMaker.js');

class CacheManager {
    constructor() {
        //An IDE may show these variables as unused due to indirect usage. Preventing via comments.
        //noinspection JSUnusedGlobalSymbols
        this.beatmapsetsCacheLimit = 3000000;
        //noinspection JSUnusedGlobalSymbols
        this.beatmapsetsCacheCleanItems = 1000000;
        //noinspection JSUnusedGlobalSymbols
        this.beatmapsCacheLimit = 1000000;
        //noinspection JSUnusedGlobalSymbols
        this.beatmapsCacheCleanItems = 700000;
    }

    async getObject(objectId, objectType) {
        const cachedObject = await dataBase.getObjectById(objectId, objectType);
        if (cachedObject) {
            //console.log(`The ${objectType} ${objectId} data received from cache`);
            return cachedObject;
        } else {
            return null;
        }
    }

    async removeObjectById(objectId, tableName) {
        await dataBase.deleteEntriesByIds(tableName, [objectId], false);
        console.log(`successfully removed ${objectId} from ${tableName} cache`);
    }

    setBeatmapset(mapsetData) {
        this.#setObject(mapsetData, 'beatmapset');
    }

    async registerEmptyBeatmapset(mapsetId) {
        await this.#setObject({id: mapsetId, data: 'empty'}, 'beatmapset');
        console.log(`successfully set ${mapsetId} as empty beatmapset`);
    }

    setBeatmap(beatmapData) {
        let filteredBeatmapData = BeatmapsFilter.filterBeatmap(beatmapData);
        this.#setObject(filteredBeatmapData, 'beatmap');
    }

    async #setObject(object, objectType) {
        try {
            const objectSizeLimit = this[`${objectType}sCacheLimit`];

            if (await dataBase.getObjectCount(objectType) + 1 >= objectSizeLimit) {
                await this.cleanItemsAmount(objectType);
            }

            const objectId = String(object.id);

            await dataBase.setObject(objectId, object,  Date.now(), objectType);
            // !This log should be removed before release due to extra DB queries
            console.log(`${objectType} ${object.id} загруженна в BD`, await dataBase.getObjectCount(objectType));
        } catch(err) {
            throw new Error(`Failed to cache ${objectType} \n${err.message}`);
        }
    }

    async cleanItemsAmount(objectType, amount = null) {
        try {
            if (amount === 'all' || amount === '*') amount = 10000000;
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

    async getObjectByIdFromDB(id, objectType) {
        try {
            const startTime = Date.now();
            const result = await dataBase.getObjectById(id, objectType);
            const endTime = Date.now();
            console.log(result);
            console.log(`Operation to get ${objectType} by ID ${id} took ${endTime - startTime} ms`);
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

    async cleanObjectArchive(objectType) {
        const archiveObjectCount = await dataBase.getObjectCount(objectType, true);
        console.log(archiveObjectCount);
        const cleanStatus = await dataBase.cleanObjectArchive(objectType);
        if (cleanStatus) {
            console.log(`Таблица для ${objectType} очищена. Убрано: ${archiveObjectCount} записей`);
        }
    }
}

module.exports = CacheManager;
