const routeRequestsCount = {};

function requestLogger(req, res, next) {
    let routeKey = '';

    if (req.path.startsWith('/api/')) {
        const pathAfterApi = req.path.slice(5);
        routeKey = pathAfterApi.split('/')[0];
    } else {
        routeKey = req.path === '/' ? 'root' : req.path.replace(/\//g, '');
    }

    if (!routeRequestsCount[routeKey]) {
        routeRequestsCount[routeKey] = 0;
    }
    routeRequestsCount[routeKey]++;

    next();
}

setInterval(() => {
    console.log("--- 🌸 What we've received in last 5 min 🌸 ---");
    for (const [route, count] of Object.entries(routeRequestsCount)) {
        console.log(`${route}: ${count}`);
    }
    console.log('-----------------------------------------------');

    for (const key in routeRequestsCount) {
        routeRequestsCount[key] = 0;
    }
}, 300000);

module.exports = requestLogger;
