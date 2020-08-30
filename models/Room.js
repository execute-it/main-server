let mongoose = require('mongoose')
let validator = require('validator')
const {UserSchema} = require('./User')

let RoomSchema = new mongoose.Schema({
    inviteCode: {
        type: String,
        required: true,
        unique: true
    },
    RoomName: {
        type: String,
        required: true
    },
    host: {
        type: UserSchema,
        required: true
    },
    participants: {
        type: [UserSchema]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})


module.exports = mongoose.model('Room', RoomSchema)