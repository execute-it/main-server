const {User} = require('../models/User')
const passport = require('passport')

verifyUser = async (input) => {
    return User.findOne({ googleId: input.googleId });
}

jwtAuth = passport.authenticate('jwt',{ session: false })

module.exports = {
    verifyUser,
    jwtAuth
}