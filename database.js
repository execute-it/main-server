let mongoose = require('mongoose');

const logger = require('./utils/logger')
const server = process.env.MONGO_HOST; // REPLACE WITH YOUR DB SERVER
const database = process.env.MONGO_DB_NAME;      // REPLACE WITH YOUR DB NAME

class Database {
    constructor() {
        this._connect()
    }

    _connect() {
        mongoose.connect(`mongodb://${server}/${database}`,
            {
                "auth": {
                    "authSource": "admin"
                },
                "user": process.env.MONGO_USER,
                "pass": process.env.MONGO_PASSWORD,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                useCreateIndex: true

            })
            .then(() => {
                logger.info('Database connection successful')
            })
            .catch(err => {
                logger.error('Database connection error', err)
            })
    }
}

module.exports = new Database()