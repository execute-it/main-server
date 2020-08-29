const express = require('express')
const router = express.Router()
const {ensureAuth, ensureGuest} = require('../middleware/auth')
router.get('/',ensureGuest, (req, res) => {
    res.send('lol')
})

router.get('/dashboard', ensureAuth,(req,res)=>{
    res.send('<h1>Dashboard</h1>')
})

module.exports = router
