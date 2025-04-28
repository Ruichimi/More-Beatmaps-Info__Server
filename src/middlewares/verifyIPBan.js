const users = require('$/models/users');

async function verifyIPBan(req, res, next) {
    const ipInBlackListIfExists = await users.getIPFromBlackListIfExist(req.ip);

    if (ipInBlackListIfExists) {
        console.log(`The request from api "${req.ip}" has been denied due the ban`);
        return res.status(403).json({ message: 'Your IP is banned.' });
    }

    next();
}

module.exports = verifyIPBan;
