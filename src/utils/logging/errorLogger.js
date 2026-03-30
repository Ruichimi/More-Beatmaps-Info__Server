const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '../../../logs/error.log');

function logError(error) {
    try {
        const message =
            `[${getTime(true)}]\n` +
            formatError(error) +
            '\n\n';

        fs.appendFile(logPath, message, (e) => {
            if (e) console.error('Failed log writing:', e);
        });
    } catch (e) {
        console.error('Logger crashed:', e);
    }
}

function formatError(error, indent = 0) {
    const pad = ' '.repeat(indent);

    if (!(error instanceof Error)) {
        return pad + JSON.stringify(error, null, 2);
    }

    const { base, cause } = extractError(error);

    let result = '';

    if (base.stack) {
        result += `${pad}${base.stack}\n`;
    } else {
        result += `${pad}${error.name}: ${base.message}\n`;
    }

    Object.entries(base).forEach(([key, value]) => {
        if (key === 'message' || key === 'stack') return;

        result += `${pad}${key}: ${
            typeof value === 'object'
                ? JSON.stringify(value, null, 2)
                : value
        }\n`;
    });

    if (cause) {
        result += `${pad}Caused by:\n`;
        result += formatError(cause, indent + 2);
    }

    return result;
}

function extractError(error) {
    if (!(error instanceof Error)) {
        return {
            type: typeof error,
            value: error
        };
    }

    const base = {};
    let cause;

    Object.getOwnPropertyNames(error).forEach((key) => {
        if (key === 'cause') {
            cause = error[key];
        } else {
            base[key] = error[key];
        }
    });

    return { base, cause };
}

module.exports = logError;
