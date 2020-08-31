let mongoose = require('mongoose')
let validator = require('validator')
const { UserSchema } = require('./User')
const { v4: uuidv4 } = require('uuid');

let RoomSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: function genUUID() {
            return uuidv4()
        },
        primaryKey: true

    },
    roomName: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        default: 'room_created'
    },
    inviteCode: {
        type: String,
        default: function () {
            return uuidv4()
        },
        unique: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    roomURL: {
        type: String
    }
})


module.exports = mongoose.model('Room', RoomSchema)