const logger = require('./utils/logger')
const express = require('express')
const expressPino = require('express-pino-logger');
const passport = require('passport')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
var compression = require('compression')
var cors = require('cors')
const querystring = require('querystring');

require('./configs/db.js')
require('./configs/passport')(passport)

const expressLogger = expressPino({ logger });
const port = parseInt(process.env.PORT)
const app = express()

//DISABLE THIS FOR PROD
app.use(cors())

app.use(compression())
app.use(expressLogger);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/rooms', require('./routes/rooms'))
app.get('/port-fwd-auth', (req, res)=>{
    const requestURI = req.url
    const token = querystring.parse(requestURI.split('?')[1]).token
    const redirectUrl = querystring.parse(requestURI.split('?')[1]).redirect
    if(!token)
        return res.status(400).json({status: "No token in query"})
    res.cookie('token', token, {maxAge: 900000})
    res.redirect(redirectUrl)
})

const server = app.listen(port, () => {
    logger.info(`Listening at http://localhost:${port}`)
})

// Handle terminal (docker exec) connections
require('./terminalConnect/terminalConnect')(server)