require('dotenv').config({path: `.env.${process.env.NODE_ENV}`})

const express = require('express')
const pino = require('pino');
const expressPino = require('express-pino-logger');

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    prettifier: require('pino-colada')
});

const expressLogger = expressPino({logger});
const port = parseInt(process.env.port)
const app = express()

app.use(expressLogger);

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(port, () => {
    logger.info(`Listening at http://localhost:${port}`)
})