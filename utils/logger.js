const pino = require('pino');

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    prettifier: require('pino-colada')
});

module.exports = logger