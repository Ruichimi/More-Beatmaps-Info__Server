const db = require('$/DB.js');

/**
 * This class is designed to monitor clients using the server
 * in order to detect potential DDoS attacks and block suspicious IP addresses.
 *
 * It keeps track of active clients during the current session
 * using the `activeUsers` property and provides tools for monitoring and blocking.
 *
 * Collected data: the client's IP address and the URL of the requested route.
 * This data is stored only in RAM for the duration of a single session,
 * is not transmitted elsewhere, and is accessible only to the server administrator.
 * It's applies to the entire project.
 *
 * Exception: IP addresses manually blocked by the administrator due to DDoS activity
 * are stored in a database to prevent repeated attempts until they are unblocked.
 */
class Users {
    constructor() {
        this.activeUsers = new Map();
        this.sessionIdCounter = 1;
    }

    trackClient(user, clientIP, requestUrl) {
        this.addActiveUser(user, clientIP, true);
        this.registerUsersUrl(clientIP, requestUrl);
    }

    registerUsersUrl(clientIP, requestUrl) {
        const requestPath = requestUrl.split('?')[0];
        const endPointName = requestPath.split('/')[2];
        const user = this.getUserByIP(clientIP);

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

    addActiveUser(user, clientIP, skipIfExists = false) {
        if (skipIfExists) {
            if (this.getUserByIP(clientIP)) {
                //console.log(`User with id ${user.id} already exists`)
                return;
            }
        }

        if (!user.requestsCounts) user.requestsCounts = {};
        if (!user.lastRequestsUrls) user.lastRequestsUrls = [];

        user.clientIP = clientIP;

        if (!user.sessionId) {
            user.sessionId = this.sessionIdCounter++;
        }

        this.activeUsers.set(clientIP, user);
    }


    getAllUsers(raw = false) {
        const users = [];

        for (const user of this.activeUsers.values()) {
            if (raw) {
                users.push(user);
            } else {
                users.push(`${user.sessionId}: Requests: [ ${this.formatRequestsCounts(user.requestsCounts)} ]`);
            }
        }

        return users;
    }

    formatUser(user) {
        const formatedUser = {};

        formatedUser.id = user.id;
        formatedUser.ExperationAt = new Date(user.exp * 1000).toLocaleString();
        formatedUser.IssuedAt = new Date(user.iat * 1000).toLocaleString();
        formatedUser.requestsCounts = this.formatRequestsCounts(user.requestsCounts);

        const result = {};
        result[user.sessionId] = formatedUser;

        return result;
    }

    formatRequestsCounts(requestsCounts) {
        return Object.entries(requestsCounts)
            .map(([url, count]) => `${url}: ${count}`)
            .join(', ');
    }


    getUserByIdCounterOrIP(userIdentificator, formated = false) {
        if (userIdentificator.includes('.')) {
            return this.getUserByIP(userIdentificator, formated);
        } else {
            return this.getUserBySessionId(Number(userIdentificator), formated);
        }
    }

    getUserByIP(ip, formated = false) {
        const user = this.activeUsers.get(ip);

        if (!user) return null;

        if (formated) {
            return this.formatUser(user);
        }
        return user;
    }

    getUserBySessionId(sessionId, formated = false) {
        let foundUser = null;
        for (const user of this.activeUsers.values()) {
            if (user.sessionId === sessionId) {
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
        await db.runAsync(`INSERT OR IGNORE INTO banned_ips (ip) VALUES (?)`, [ip]);
        console.log(`User with id ${ip} has been added to black list`);
    }

    async unbanIP(ip) {
        await db.runAsync(`DELETE FROM banned_ips WHERE ip = ?`, [ip]);
        console.log(`User with id ${ip} has been removed from the black list`);
    }

    async getIPFromBlackListIfExist(ip) {
        return await db.getAsync(`SELECT * FROM banned_ips WHERE ip = ?`, [ip]);
    }
}

module.exports = new Users();
