const db = require('$/DB.js');

class Users {
    constructor() {
        this.activeUsers = new Map();
    }

    registerUsersUrl(userIP, requestUrl) {
        const requestPath = requestUrl.split('?')[0];
        const endPointName = requestPath.split('api/')[1];
        const user = this.getUserByIP(userIP);

        this.addUserRequestUrl(user, requestUrl);
        this.incrementUserRequestsCount(user, endPointName);
    }

    addUserRequestUrl(user, requestUrl) {
        user.lastRequestsUrls.unshift(requestUrl);
        if (user.lastRequestsUrls.length > 10) {
            user.lastRequestsUrls.pop();
        }
    }

    incrementUserRequestsCount(user, endPointName) {
        if (!user.requestsCounts[endPointName]) {
            user.requestsCounts[endPointName] = 1;
        } else {
            user.requestsCounts[endPointName]++;
        }
    }

    addActiveUser(user, clientIP, replaceIfExist = false) {
        if (replaceIfExist) {
            if (this.getUserByIP(clientIP)) {
                //console.log(`User with id ${user.id} already exists`)
                return;
            }
        }

        if (!user.requestsCounts) user.requestsCounts = {};
        if (!user.lastRequestsUrls) user.lastRequestsUrls = [];

        user.clientIP = clientIP;

        this.activeUsers.set(clientIP, user);
    }

    getAllUsers(raw = false) {
        const users = [];

        for (const user of this.activeUsers.values()) {
            if (raw) {
                users.push(user);
            } else {
                users.push(this.formatUser(user));
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
