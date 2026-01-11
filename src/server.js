const express = require('express');
const path = require('path');

const cors = require('cors');
require('dotenv').config();
require('module-alias/register');

const app = express();

const port = 3000;
const routes = require('./routes');
const { initCommands } = require('$/commands/ServerRunningCommandsInterface');
const requestLogger = require('./middlewares/requestsLogger');

const serverDir = path.resolve();

app.use(express.static(path.join(serverDir, 'public')));
app.set('trust proxy', 1);
app.use(express.json({ limit: '320kb' }));
app.use(requestLogger);

//Send index.html for all routes except api
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(serverDir, 'public', 'index.html'))
});

global.getTime = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
};

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: "Authorization, Content-Type, x-client-id, x-retry-request"
};

app.use(cors(corsOptions));
app.use(routes);

//127.0.0.1
app.listen(port, '127.0.0.1', async () => {
    console.log(`The server is running on port ${port}`);
});

initCommands();
