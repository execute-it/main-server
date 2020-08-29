const express = require('express')
const router = express.Router()
const docker = require('../utils/docker')
const {v4: uuidv4} = require('uuid');

router.post('/', async (req, res) => {
    const room = await docker.createRoom(
        process.env.USER_SERVER_IMAGE,
        uuidv4(),
        process.env.USER_SERVER_MEM_LIMIT,
        process.env.USER_SERVER_CPU_LIMIT,
        process.env.TRAEFIK_HOST, process.env.USER_SERVER_NETWORK)
    res.json(room)
})

module.exports = router
