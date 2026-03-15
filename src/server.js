const app = require('./app.js');

const port = 3000;

app.listen(port, '127.0.0.1', () => {
    console.log(`The server is running on port ${port}`);
});
