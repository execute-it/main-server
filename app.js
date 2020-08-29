require('dotenv').config({path: '.env.' + process.env.NODE_ENV})
const logger = require('./utils/logger')
const express = require('express')
const expressPino = require('express-pino-logger');
const session = require('express-session')
const passport = require('passport')

require('./configs/db.js')
require('./configs/passport')(passport)

const expressLogger = expressPino({logger});
const port = parseInt(process.env.PORT)
const app = express()

app.use(expressLogger);

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session())

app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/rooms', require('./routes/rooms'))

app.listen(port, () => {
    logger.info(`Listening at http://localhost:${port}`)
})