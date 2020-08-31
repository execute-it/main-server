const express = require('express')
const router = express.Router()
const passport = require('passport')
const {jwtAuth} = require('../middlewares/auth')

router.get('/',(req, res) => {
    res.status(200).json({Version: "0.1.0a"})
})

router.get('/profile', jwtAuth ,
    (req,res)=>{
    res.send(`THIS IS UR PROFILE MAAANNNN ${req.user.email}`)
})

module.exports = router
