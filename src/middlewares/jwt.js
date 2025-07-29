const jwt = require('jsonwebtoken');
const users = require('$/models/users');

const JWT_SECRET = process.env.APP_KEY;
const expectedClientId = process.env.EXPECTED_CLIENT_ID;

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    const clientId = req.headers['x-client-id'];

    if (!token || !clientId) {
        console.log(`Attempt to request without authorization token. Url: ${req.originalUrl}`);
        return res.status(401).json({ error: 'Authorization token is missing or invalid.' });
    }

    if (clientId !== expectedClientId) {
        console.warn(`Attempt to request without clientId. Url: ${req.originalUrl}`);
        return res.status(401).json({ error: 'Authorization token is missing or invalid.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Authorization token is missing or invalid.' });
        }

        users.trackClient(user, req.ip, req.url);

        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
