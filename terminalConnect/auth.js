const jwt = require('jsonwebtoken')
const querystring = require('querystring');
const {User} = require('../models/User')
const Room = require('../models/Room');

module.exports = async (requestURI) => {
    try {
        const roomId = requestURI.split('/')[1]
        const token = querystring.parse(requestURI.split('?')[1]).token
        const email = jwt.verify(token, process.env.JWT_SECRET).data.email

        const user = await User.findOne({email: email})
        const room = await Room.findOne({_id: roomId})
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