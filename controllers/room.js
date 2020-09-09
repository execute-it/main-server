const docker = require('../utils/docker')
const { v4: uuidv4 } = require('uuid')
const { User } = require('../models/User')
const Room = require('../models/Room')
const { response } = require('express')
const { isUUID } = require('validator')

const spinDockerContainer = async(req, res) => {
    try {
        if (!req.body.roomName) {
            return res.status(400).json({ status: "specify room name" })
        }

        const user = await User.findOne({ email: req.user.email })
        console.log(user, 'SDDFSFSDFSD')
        const newRoom = {
            roomName: req.body.roomName,
            host: user._id
        }
        let room
        let response

        try {
            if (await Room.findOne({ roomName: req.body.roomName })) {
                return res.status(409).json({ status: "room_name_duplicate" });
            }
            room = await Room.create(newRoom)
        } catch (e) {
            console.log(e)
            return res.status(400).json({ "status": "error" })
        }

        const spawnImage = await docker.createRoom(
            process.env.USER_SERVER_IMAGE,
            room._id,
            process.env.USER_SERVER_MEM_LIMIT,
            process.env.USER_SERVER_CPU_LIMIT,
            process.env.USER_SERVER_URL,
            process.env.USER_SERVER_NETWORK)

        if (spawnImage.status === 'created') {
            await Room.findOneAndUpdate({ _id: room._id }, { roomURL: spawnImage.roomURL }, { new: true }, (err, doc) => {
                response = {
                    status: doc.status,
                    roomName: doc.roomName,
                    createdAt: doc.createdAt,
                    inviteCode: doc.inviteCode,
                    roomURL: doc.roomURL,
                    roomId: doc._id
                }
            })
            setTimeout(() => {
                return res.status(201).json(response)
            }, 1000)
        } else {
            await Room.findOneAndUpdate({ _id: room._id }, { status: "error" }, { new: true }, (err, doc) => {
                return res.status(400).json({ status: "error" })
            })
        }

    } catch (e) {
        console.log(e)
        res.status(400).json({ status: "error" })
    }
}

const checkRoomName = async(req, res) => {
    if (!req.body.roomName) {
        return res.status(400).json({ isValid: "false" })
    }
    const newRoomName = req.body.roomName

    const room = await Room.findOne({ roomName: newRoomName })

    if (room)
        return res.status(200).json({ "isValid": false })
    return res.status(200).json({ "isValid": true })
}

const getRooms = async(req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        console.log(user._id)
        let response = []

        // rooms where user is admin
        await Room.find({ host: user._id }, '-host', (err, doc) => {
            doc.map((x) => {
                response.push({
                    roomName: x.roomName,
                    inviteCode: x.inviteCode,
                    roomURL: x.roomURL,
                    isHost: true,
                    roomId: x._id
                })
            })
        })

        //rooms where user is participant
        await Room.find({ participants: user._id }, '-participants', (err, doc) => {
            doc.map((x) => {
                response.push({
                    roomName: x.roomName,
                    inviteCode: x.inviteCode,
                    roomURL: x.roomURL,
                    isHost: false
                })
            })
        }).then(() => {
            return res.status(200).json({ status: "success", rooms: response })
        })
    } catch (e) {
        return res.status(400).json({ status: "error" })
    }


}

const joinRoom = async(req, res) => {
    const inviteCode = req.query.inviteCode
    let response;

    if (isUUID(inviteCode)) {
        try {
            const user = await User.findOne({ email: req.user.email })
            const userId = user._id
            const room = await Room.findOne({ inviteCode: inviteCode })
            console.log(room)

            //check if user is host
            if (room.host.toString() == userId.toString()) {
                return res.status(409).json({ status: 'already_joined' })
            }

            //check if user is participant
            if (room.participants.indexOf(userId) > -1) {
                return res.status(409).json({ status: 'already_joined' })
            }



            const roomJoin = await Room.findOneAndUpdate({ inviteCode: inviteCode }, { $push: { participants: userId } }, { new: true, upsert: true })

            response = {
                status: 'room_joined',
                roomName: roomJoin.roomName,
                inviteCode: roomJoin.inviteCode,
                roomURL: roomJoin.roomURL,
                roomId: roomJoin._id
            }
            return res.json(response)


        } catch (e) {
            console.log(e)
            return res.status(400).json({ status: "error" })

        }
    }

    return res.status(400).json({ status: 'invite_code_not_valid' })
}

const getRoomInfo = async(req, res) => {
    const inviteCode = req.params.inviteCode
    console.log(req.user)
    const email = req.user.email

    if (isUUID(inviteCode)) {
        const user = await User.findOne({ email: email })
        const userId = user._id

        let room = await Room.findOne({ inviteCode: inviteCode, host: user }).populate('host').populate('participants')

        if (room)
            return res.json(room)

        room = await Room.findOne({ participants: userId, inviteCode: inviteCode }).populate('host').populate('participants')

        if (room)
            return res.json(room)

        return res.status(400).json({ status: "error" })


    }

    return res.status(400).json({ status: "error" })



}

module.exports = {
    spinDockerContainer,
    checkRoomName,
    getRooms,
    joinRoom,
    getRoomInfo
}