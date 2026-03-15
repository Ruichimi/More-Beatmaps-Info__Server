const request = require('supertest');
const app = require('$/app');
const expectedClientId = process.env.EXPECTED_CLIENT_ID;

async function getToken() {
    const res = await request(app)
        .post('/api/token')
        .set('x-client-id', expectedClientId);

    return res.body.token;
}

async function api() {
    const token = await getToken();

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
