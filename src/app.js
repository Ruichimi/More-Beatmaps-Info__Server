const express = require('express');
const path = require('path');
const cors = require('cors');

require('dotenv').config();
require('module-alias/register');

const app = express();
const routes = require('./routes/index.js');
const { initCommands } = require('$/commands/server-running-commands');
const requestLogger = require('./middlewares/requestsLogger');
const errorMiddleware = require('./middlewares/errorHandler');

const serverDir = path.resolve();

app.use(express.static(path.join(serverDir, 'public')));
app.set('trust proxy', 1);
app.use(express.json({ limit: '320kb' }));
app.use(requestLogger);

//Send index.html for all routes except api
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(serverDir, 'public', 'index.html'))
});

global.getTime = (withDate = false) => {
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];

    if (!withDate) return time;

    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${date} ${time}`;
};

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: "Authorization, Content-Type, x-client-id, x-retry-request"
};

app.use(cors(corsOptions));
app.use(routes);

app.use(errorMiddleware);

initCommands();

module.exports = app;
