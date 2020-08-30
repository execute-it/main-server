const User = require('../models/User')

verifyUser = async (input)=>{
    return User.findOne({googleId: input.googleId});
}

module.exports = {
    verifyUser
}