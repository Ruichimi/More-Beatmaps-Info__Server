const jwt = require('jsonwebtoken');
const users = require('$/models/users');

const JWT_SECRET = process.env.APP_KEY;
const expectedClientId = process.env.EXPECTED_CLIENT_ID;

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    const clientId = req.headers['x-client-id'];

    if (!token || !clientId) {
        console.log('Попытка получить информацию без токена доступа');
        return res.status(401).json({ error: 'Токен отсутствует' });
    }

    if (clientId !== expectedClientId) {
        console.log('Не правильный client id');
        return res.status(401).json({ error: 'Токен отсутствует' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Неверный или просроченный токен');
            return res.status(403).json({ error: 'Неверный или просроченный токен' });
        }

        users.addActiveUser(user, req.ip, true);
        console.log(req.url);
        users.registerUsersUrl(req.ip, req.url);

        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
