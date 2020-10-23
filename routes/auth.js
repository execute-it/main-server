const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const querystring = require('querystring');
const { User } = require('../models/User')
const Room = require('../models/Room');
const { jwtAuth } = require('../middlewares/auth');
const fs = require('fs')
const secretOrKey = fs.readFileSync(`${__dirname}/../configs/private.key`);

const ISSUER = 'ConvergenceJwtGenerator';
const AUDIENCE = 'Convergence';
const ALGORITHM = 'RS256';

function generate(username, claims, keyId) {
    if (!claims) {
        claims = {};
    }
    const reserved = ['aud', 'iat', 'sub', 'jti', 'nbf', 'exp'];

    const options = {
        algorithm: ALGORITHM,
        audience: AUDIENCE,
        issuer: ISSUER,
        expiresIn: '1d',
        subject: username,
        header: {
            kid: keyId
        }
    };

    for (let prop in Object.getOwnPropertyNames(claims)) {
        if (reserved.indexOf(prop) >= 0) {
            throw new Error('The claim name ' + prop + ' is reserved.');
        }
    }
    console.log(secretOrKey, options)

    return jwt.sign(claims, secretOrKey, options);
}

router.get('/', async(req, res) => {
    console.log(req.headers)
    try {
        const requestURI = req.headers['x-forwarded-uri']
        const roomId = req.headers['x-forwarded-prefix'] ? req.headers['x-forwarded-prefix'].split('/')[1] : querystring.parse(requestURI.split('?')[1]).roomId
        const token = querystring.parse(requestURI.split('?')[1]).token || req.cookies['token']
        const email = jwt.verify(token, secretOrKey, { algorithms: ['RS256'] }).email

        const user = await User.findOne({ email: email })
        const room = await Room.findOne({ _id: roomId })
        const userId = user._id

        //check id user is host
        if (room.host.toString() == userId.toString()) {
            return res.status(200).send('go ahead comrade')
        }

        //check if user is participant
        if (room.participants.indexOf(userId) > -1) {
            return res.status(200).send({ status: 'go ahead comrade' })
        }

        return res.status(401).send('Unauthorised')
    } catch (e) {
        return res.status(401).send('Unauthorised')
    }

})

router.get('/verify', jwtAuth, (req, res) => {
    return res.status(200).json(req.user)
})

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate(
    'google', {
        session: false,
        scope: ["profile", "email"],
        accessType: "offline",
        approvalPrompt: "force"
    }))


// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate(
        'google', {
            failureRedirect: '/',
            session: false
        }),
    (req, res) => {
        let user = {
            displayName: JSON.stringify(req.user),
            // name: req.user.firstName,
            email: req.user.email,
            // image: req.user.image,
            firstName: req.user.firstName,
            lastName: req.user.lastName
        }

        // let token = jwt.sign({
        //     data: user
        // }, secretOrKey, { expiresIn: '1d' })

        const keyId = "my-convergence-key";

        // const gen = new generate(keyId, secretOrKey);

        // Provide optional information about the uers.
        const claims = user;

        // Provide the username
        const username = req.user.email;

        // Generate the token
        var token = generate(username, claims, keyId);
        console.log(token)

        res.redirect(`${process.env.FRONTEND_REDIRECT_URL}?token=${token}`)
    }
)

// @desc    logout user
// @route   /auth/logout
router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('http://localhost:3000')
})
module.exports = router