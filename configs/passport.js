const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const { User } = require('../models/User')
const logger = require('../utils/logger')
const JwtStrategy = require('passport-jwt').Strategy
const { verifyUser } = require('../middlewares/auth')
const fs = require('fs')
let opts = {}
opts.jwtFromRequest = function(req) {
    let token = null;
    if (req) {
        console.log(req.headers)
        token = req.headers['x-api-key']
    }
    return token
};
opts.secretOrKey = fs.readFileSync(`${__dirname}/private.key`);
opts.algorithms = ['RS256']

module.exports = function(passport) {
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        console.log("JWT BASED  VALIDATION GETTING CALLED")
        console.log("JWT", jwt_payload)

        if (verifyUser(jwt_payload)) {
            return done(null, jwt_payload)
        } else {
            // user account doesnt exists in the DATA
            return done(null, false);
        }
    }));
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    }, async(accessToken, refreshToken, profile, done) => {
        console.log(profile)
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value,
            email: profile.emails[0].value
        }

        try {
            let user = await User.findOne({ googleId: profile.id })

            if (user) {
                console.log('lol')
                done(null, user)
            } else {
                user = await User.create(newUser)
                done(null, user)
            }
        } catch (e) {
            console.error(e)
        }
    }))
    passport.serializeUser(function(user, cb) {
        console.log('I should have jack ')
        cb(null, user);
    });

    passport.deserializeUser(function(obj, cb) {
        console.log('I wont have jack shit')
        cb(null, obj);
    });
}