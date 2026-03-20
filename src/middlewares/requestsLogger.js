const routeRequestsCount = {};
const log = process.env.NODE_ENV !== 'test';

function requestLogger(req, res, next) {
    if (!log) return next();

    if (!req.path.startsWith('/api/')) return next();

    const pathAfterApi = req.path.slice(5);
    const routeKey = pathAfterApi.split('/')[0] || 'root';

    if (!routeRequestsCount[routeKey]) {
        routeRequestsCount[routeKey] = 0;
    }

    routeRequestsCount[routeKey]++;

    next();
}

if (log) {
    setInterval(() => {
        console.log("--- 🌸 What we've received in last 5 min 🌸 ---");
        for (const [route, count] of Object.entries(routeRequestsCount)) {
            console.log(`${route}: ${count}`);
        }
        console.log('-----------------------------------------------');

        for (const key in routeRequestsCount) {
            routeRequestsCount[key] = 0;
        }
    }, 5 * 60 * 1000);

    setInterval(() => {
        console.log('🧹 Cleaned all requests');
        for (const key in routeRequestsCount) {
            delete routeRequestsCount[key];
        }
    }, 60 * 60 * 1000);
}

module.exports = requestLogger;
