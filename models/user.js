let mongoose = require('mongoose')
let validator = require('validator')
let timestampPlugin = require('./plugins/timestamp')

let userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: (value) => {
            return validator.isEmail(value)
        }
    },
    createdAt: Date
})

userSchema.plugin(timestampPlugin)

module.exports = mongoose.model('User', userSchema)