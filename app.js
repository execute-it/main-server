require('dotenv').config({path: '.env.' + process.env.NODE_ENV})
const logger = require('./utils/logger')
const express = require('express')
const expressPino = require('express-pino-logger');
const passport = require('passport')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

require('./configs/db.js')
require('./configs/passport')(passport)

const expressLogger = expressPino({logger});
const port = parseInt(process.env.PORT)
const app = express()

app.use(expressLogger);
app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(passport.initialize());

app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/rooms', require('./routes/rooms'))

app.listen(port, () => {
    logger.info(`Listening at http://localhost:${port}`)
})