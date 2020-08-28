require('dotenv').config({path: '.env.' + process.env.NODE_ENV})
const logger = require('./utils/logger')
const express = require('express')
const expressPino = require('express-pino-logger');
const docker = require('./utils/docker')
const {v4: uuidv4} = require('uuid');

const expressLogger = expressPino({logger});
const port = parseInt(process.env.PORT)
const app = express()

app.use(expressLogger);

app.get('/', (req, res) => {
    res.status(200).send({error: 'Something blew up'})
})

app.post('/rooms', async (req, res) => {
    const room = await docker.createRoom(
        process.env.USER_SERVER_IMAGE,
        uuidv4(),
        process.env.USER_SERVER_MEM_LIMIT,
        process.env.USER_SERVER_CPU_LIMIT,
        process.env.TRAEFIK_HOST, process.env.USER_SERVER_NETWORK)
    res.json(room)
})

app.listen(port, () => {
    logger.info(`Listening at http://localhost:${port}`)
})