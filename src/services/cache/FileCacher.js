const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

class FileCacher {
    constructor() {
        this.db = this.runDB();
        this.createTables();
        this.getAsync = promisify(this.db.get).bind(this.db);
        this.runAsync = promisify(this.db.run).bind(this.db);
    }

    runDB() {
       return new sqlite3.Database('database.db', (err) => {
           if (err) {
               console.error('Ошибка при подключении к базе данных:', err.message);
           }
       });
    }

    createTables() {
        this.db.run(`CREATE TABLE IF NOT EXISTS mapsets (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL
        )`);

        this.db.run(`CREATE TABLE IF NOT EXISTS beatmaps (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL
        )`);
    }

    async getObjectCache(objectType) {
        try {
            const tableName = this.getTableNameByObjectType(objectType);
            const rows = await this.getAsync(`SELECT * FROM ${tableName}`);
            return rows.reduce((acc, { id, data }) => {
                acc[id] = JSON.parse(data);
                return acc;
            }, {});
        } catch (error) {
            throw new Error(`Failed to get data ${objectType} from db: ${error.message}`);
        }
    }

    setObject(objectId, object, objectType) {
        return new Promise((resolve, reject) => {
            const tableName = this.getTableNameByObjectType(objectType);
            this.db.run(
                `INSERT OR IGNORE INTO ${tableName} (id, data) VALUES (?, ?)`,
                [objectId, JSON.stringify(object)],
                function (err) {
                    if (err) {
                        reject(new Error(`Failed to append data: ${err.message}`));
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    async replaceTableData(data, objectType) {
        try {
            const tableName = this.getTableNameByObjectType(objectType);

            await new Promise((resolve, reject) => {
                this.db.run(`DELETE FROM ${tableName}`, function (err) {
                    if (err) {
                        reject(new Error(`Failed to clear table ${tableName}: ${err.message}`));
                    } else {
                        resolve();
                    }
                });
            });

            for (const [id, object] of Object.entries(data)) {
                await this.setObject(id, object, objectType);
            }
        } catch (error) {
            throw new Error(`Failed to replace data in table ${objectType}: ${error.message}`);
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
            const row = await this.getAsync(`SELECT * FROM ${tableName} WHERE id = ?`, [objectId]);

            return row ? JSON.parse(row.data) : null;
        } catch (error) {
            throw new Error(`Failed to get object with id ${objectId} from ${objectType}: ${error.message}`);
        }
    }


}

module.exports = FileCacher;
