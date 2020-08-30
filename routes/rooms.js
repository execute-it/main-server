const express = require('express')
const router = express.Router()
const docker = require('../utils/docker')
const {v4: uuidv4} = require('uuid');
const passport = require('passport');
const Room = require('../models/Room')

router.get('/',  passport.authenticate(
    'jwt',
    { session: false }),
    async (req,res)=>{
        res.send(req.user)
    })


router.post('/', passport.authenticate(
    'jwt',
    { session: false }) ,async (req, res) => {
    console.log(req.user)
    const room = await docker.createRoom(
        process.env.USER_SERVER_IMAGE,
        uuidv4(),
        process.env.USER_SERVER_MEM_LIMIT,
        process.env.USER_SERVER_CPU_LIMIT,
        process.env.USER_SERVER_URL,
        process.env.USER_SERVER_NETWORK)
    res.json(room)
})

module.exports = router
