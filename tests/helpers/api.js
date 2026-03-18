const request = require('supertest');

async function getToken(app, expectedClientId = process.env.EXPECTED_CLIENT_ID) {
    const res = await request(app)
        .post('/api/token')
        .set('x-client-id', expectedClientId);

    return res.body.token;
}

async function api() {
    const app = require('$/app');
    const expectedClientId = process.env.EXPECTED_CLIENT_ID;
    const token = await getToken(app, expectedClientId);

    const headers = {
        'x-client-id': expectedClientId,
        Authorization: `Bearer ${token}`
    };

    const client = request(app);

    const applyHeaders = (req) => {
        Object.entries(headers).forEach(([k, v]) => req.set(k, v));
        return req;
    };

    return {
        get: (url) => applyHeaders(client.get(url)),
        post: (url) => applyHeaders(client.post(url)),
        put: (url) => applyHeaders(client.put(url)),
        delete: (url) => applyHeaders(client.delete(url))
    };
}

module.exports = api;
