const jwt = require('jsonwebtoken')
const { User } = require('../models/User')
const Room = require('../models/Room');
const fs = require('fs')

const secretOrKey = fs.readFileSync(`${__dirname}/../configs/private.key`);

module.exports = async(queryParams) => {
    try {
        const email = jwt.verify(queryParams.token, secretOrKey, { algorithms: ['RS256'] }).data.email

        const user = await User.findOne({ email: email })
        const room = await Room.findOne({ _id: queryParams.roomId })
        const userId = user._id

        //check id user is host
        if (room.host.toString() === userId.toString()) {
            return true
        }

        //check if user is participant
        return room.participants.indexOf(userId) > -1;


    } catch (e) {
        return false
    }

}