const db = new (require('$/DB.js'))();

class DBCacher {
    async setObject(objectId, object, objectDate, objectType) {
        try {
            const tableName = this.getTableNameByObjectType(objectType);
            await db.runAsync(`INSERT OR IGNORE INTO ${tableName} (id, data, created_at)
                           VALUES (?, ?, ?)`, [objectId, JSON.stringify(object), objectDate]);

            console.log(`Loaded beatmap ${objectId} to DB`);
        } catch (err) {
            throw new Error(`Failed to append data: ${err.message}`);
        }
    }

    getTableNameByObjectType(objectType) {
        if (objectType === 'beatmapset') return 'mapsets';
        if (objectType === 'beatmap') return 'beatmaps';
        throw new Error(`File cacher error: unknown object type \'${objectType}\'`);
    }

    async getObjectById(objectId, objectType) {
        try {
            const tableName = this.getTableNameByObjectType(objectType);
            const row = await db.getAsync(`SELECT *
                                           FROM ${tableName}
                                           WHERE id = ?`, [objectId]);

            return row ? JSON.parse(row.data) : null;
        } catch (error) {
            throw new Error(`Failed to get object with id ${objectId} from ${objectType}: ${error.message}`);
        }
    }

    async clearOldEntries(objectType, amount) {
        try {
            const tableName = this.getTableNameByObjectType(objectType);
            const rows = await this.fetchOldestEntries(tableName, amount);

            if (rows.length > 0) {
                const idsToDelete = [];
                while (rows.length > 0 && idsToDelete.length < amount) {
                    const row = rows.pop();
                    idsToDelete.push(`'${row.id}'`);
                }

                await this.deleteEntriesByIds(tableName, idsToDelete);

                console.log(`Удалено ${idsToDelete.length} записей из таблицы ${tableName}`);
            }
        } catch (error) {
            throw new Error(`Failed to clear old entries from ${objectType}: ${error.message}`);
        }
    }

    async fetchOldestEntries(tableName, limit) {
        return await db.allAsync(`
            SELECT id
            FROM ${tableName}
            ORDER BY created_at
            LIMIT ?`, [limit]);
    }

    async deleteEntriesByIds(tableName, ids) {
        const deletedTableName = `${tableName}_archive`; // Формируем имя таблицы для хранения удалённых данных

        await db.runAsync(`
            INSERT INTO ${deletedTableName} (id, data, created_at, deleted_at)
            SELECT id, data, created_at, strftime('%s', 'now')
            FROM ${tableName}
            WHERE id IN (${ids.join(',')})
        `);

        // Теперь удаляем их из основной таблицы
        await db.runAsync(`
            DELETE
            FROM ${tableName}
            WHERE id IN (${ids.join(',')})
        `);
    }

    async getObjectCount(objectType) {
        const tableName = this.getTableNameByObjectType(objectType);
        return await db.getAsync(`SELECT COUNT(*) AS count
                                  FROM ${tableName}`);
    }


    /**
     * The DB size returns approximate value and not for the specific table but for the entire db.
     *
     * @param objectType - Type of object to work with require table.
     * @returns {Promise<{size: number, count}>}
     */
    async getTableStats(objectType) {
        try {
            const countRow = await this.getObjectCount(objectType);
            const sizeRow = await db.getAsync(`PRAGMA page_count;`);
            const pageSizeRow = await db.getAsync(`PRAGMA page_size;`);
            const size = sizeRow.page_count * pageSizeRow.page_size;
            return {count: countRow.count, size};
        } catch (error) {
            throw new Error(`Failed to get table stats for ${objectType}: ${error.message}`);
        }
    }

    async getMaxObjectId(tableName) {
        try {
            let row = await db.getAsync(`SELECT MAX(id) AS maxId
                                         FROM ${tableName}`);
            return Number(row?.maxId) || 0;
        } catch (error) {
            throw new Error(`Failed to get max object id for ${tableName} table:\n${error.message}`);
        }
    }
}

module.exports = DBCacher;
