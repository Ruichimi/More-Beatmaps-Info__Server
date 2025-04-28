const db = require('$/DB.js');

class Users {
    constructor() {
        this.activeUsers = new Map();
    }

    incrementRequestsCount(userIP, requestUrl) {
        const user = this.getUserByIP(userIP);

        if (!user.requestsCounts[requestUrl]) {
            user.requestsCounts[requestUrl] = 1;
        } else {
            user.requestsCounts[requestUrl]++;
        }
    }

    addActiveUser(user, clientIP, replaceIfExist = false) {
        if (replaceIfExist) {
            if (this.getUserByIP(clientIP)) {
                return console.log(`User with id ${user.id} already exists`);
            }
        }

        if (!user.requestsCounts) {
            user.requestsCounts = {};
        }
        user.clientIP = clientIP;

        this.activeUsers.set(clientIP, user);
    }

    getAllUsers(formated = false) {
        const users = [];

        for (const user of this.activeUsers.values()) {
            if (formated) {
                users.push(this.formatUser(user));
            } else {
                users.push(user);
            }
        }

        return users;
    }

    formatUser(user) {
        const formatedUser = {};
        formatedUser.id = user.id;
        formatedUser.ExperationAt = new Date(user.exp * 1000).toLocaleString();
        formatedUser.IssuedAt = new Date(user.iat * 1000).toLocaleString();

        let requestsCountsString = '';
        for (const [url, count] of Object.entries(user.requestsCounts)) {
            requestsCountsString += `${url}: ${count}, `;
        }

        requestsCountsString = requestsCountsString.slice(0, -2);

        formatedUser.requestsCounts = requestsCountsString;

        const result = {};
        result[user.clientIP] = formatedUser;

        return result;
    }

    getUserByIP(ip, formated = false) {
        const user = this.activeUsers.get(ip);

        if (formated) {
            return this.formatUser(user);
        }
        return user;
    }

    getUserByID(id, formated = false) {
        let foundUser = null;
        for (const user of this.activeUsers.values()) {
            if (user.id === id) {
                foundUser = user;
                break;
            }
        }

        if (!foundUser) return null;

        if (formated) {
            return this.formatUser(foundUser);
        }

        return foundUser;
    }

    async banIP(ip) {
        console.log(ip);
        await db.runAsync(`INSERT OR IGNORE INTO banned_ips (ip) VALUES (?)`, [ip]);
        console.log(`User with id ${ip} has been added to black list`);
    }

    async unbanIP(ip) {
        console.log(ip);
        await db.runAsync(`DELETE FROM banned_ips WHERE ip = ?`, [ip]);
        console.log(`User with id ${ip} has been removed from the black list`);
    }

    async getIPFromBlackListIfExist(ip) {
        return await db.getAsync(`SELECT * FROM banned_ips WHERE ip = ?`, [ip]);
    }
}

module.exports = new Users();
