const express = require('express')
const router = express.Router()
const {jwtAuth} = require('../middlewares/auth')
const roomController = require('../controllers/room')

// @desc    Get rooms that user has joined or hosted
// @route   GET /rooms
router.get('/',jwtAuth,roomController.getRooms)

// @desc    Create a new room
// @route   POST /rooms
router.post('/', jwtAuth, roomController.spinDockerContainer)

// @desc    Join a new room using invite code
// @route   POST /rooms/join
router.post('/join',jwtAuth,roomController.joinRoom)

// @desc    Check if the room name is available
// @route   GET /rooms/checkRoomName
router.get('/checkRoomName',jwtAuth,roomController.checkRoomName)

// @desc    Get information of a particular room
// @route   GET /rooms/:inviteCode(uuid4)
router.get('/:inviteCode([0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12})',jwtAuth,roomController.getRoomInfo)

module.exports = router
