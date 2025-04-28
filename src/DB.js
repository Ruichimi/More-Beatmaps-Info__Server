const {promisify} = require("util");
const sqlite3 = require("sqlite3").verbose();

/**
 * Connection to local database - SQLite and creating tables.
 * The tables will create if needed just when the server starts.
 * To recreate it, it must be deleted
 */
class DB {
    constructor(dbFile = "database.db") {
        this.db = new sqlite3.Database(dbFile, (err) => {
            if (err) {
                console.error("Ошибка при подключении к базе данных:", err.message);
            } else {
                console.log("Успешное подключение к базе данных");
            }
        });
        this.db.run("PRAGMA journal_mode=WAL;", (err) => {
            if (err) {
                console.error("Ошибка при установке WAL режима:", err.message);
            }
        });
        this.db.run("PRAGMA synchronous = NORMAL;", (err) => {
            if (err) {
                console.error("Ошибка при установке synchronous = NORMAL:", err.message);
            }
        });
        this.getAsync = promisify(this.db.get).bind(this.db);
        this.runAsync = promisify(this.db.run).bind(this.db);
        this.allAsync = promisify(this.db.all).bind(this.db);
        this.createTables();
    }

    createTables() {
        const queries = [
            `CREATE TABLE IF NOT EXISTS mapsets
             (
                 id         INTEGER PRIMARY KEY,
                 data       TEXT    NOT NULL,
                 created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
             );`,
            `CREATE TABLE IF NOT EXISTS beatmaps
             (
                 id         INTEGER PRIMARY KEY,
                 data       TEXT    NOT NULL,
                 created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
             );`,
            `CREATE TABLE IF NOT EXISTS mapsets_archive
             (
                 id         INTEGER PRIMARY KEY,
                 data       TEXT    NOT NULL,
                 created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
                 deleted_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
             );`,
            `CREATE TABLE IF NOT EXISTS beatmaps_archive
             (
                 id         INTEGER PRIMARY KEY,
                 data       TEXT    NOT NULL,
                 created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
                 deleted_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
             );`,
             `CREATE TABLE IF NOT EXISTS banned_ips
              (
                  id         INTEGER PRIMARY KEY AUTOINCREMENT ,
                  ip       TEXT    NOT NULL,
                  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
              );`
        ];

        queries.forEach((query) => {
            this.db.run(query, (err) => {
                if (err) {
                    console.error("Ошибка при создании таблицы:", err.message);
                }
            });
        });
    }

    /**
     * Currently useless, 'cause we have only one service to the database with constant necessity.
     */
    // close() {
    //     this.db.close((err) => {
    //         if (err) {
    //             console.error("Ошибка при закрытии базы данных:", err.message);
    //         } else {
    //             console.log("База данных закрыта");
    //         }
    //     });
    // }
}

module.exports = new DB();
