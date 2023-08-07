const { model } = require("../models/Room")

// Configure CORS whitelisted domains here
let corsWhitelist = ['https://executeit.app', 'https://www.executeit.app', 'http://localhost:3000', 'https://pict.sudolms.in']

// All domains (*) allowed if NODE_ENV is dev
corsWhitelist = process.env.NODE_ENV === 'dev' ? '*' : corsWhitelist

let corsOptions = {
    origin: corsWhitelist
}

module.exports = corsOptions;
