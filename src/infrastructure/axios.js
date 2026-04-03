const axios = require('axios');

const instance = axios.create();

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

module.exports = instance;
