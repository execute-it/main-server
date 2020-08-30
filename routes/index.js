const express = require('express')
const router = express.Router()
const passport = require('passport')

router.get('/',(req, res) => {
    res.send('<h1>lol</h1>')
})

router.get('/profile', passport.authenticate(
    'jwt',
    { session: false }) ,
    (req,res)=>{
    res.send(`THIS IS UR PROFILE MAAANNNN ${req.user.email}`)
})



module.exports = router
