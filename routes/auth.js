const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')

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
        'google',
        {
            failureRedirect: '/' ,
            session: false
        }),
    (req, res) => {
        let user = {
            displayName: req.user.displayName,
            name: req.user.firstName,
            email: req.user.email,
           }

        let token = jwt.sign({
            data: user
        }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.cookie('jwt', token)
        res.redirect('/profile')}
)

// @desc    logout user
// @route   /auth/logout
router.get('/logout', (req,res)=>{
    req.logout()
    res.redirect('/')
})
module.exports = router
