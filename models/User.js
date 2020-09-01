let mongoose = require('mongoose')
let validator = require('validator')

let UserSchema = new mongoose.Schema({
    googleId: {
      type: String,
      required: true
    },
    displayName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: (value) => {
            return validator.isEmail(value)
        }
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

const User = mongoose.model('User', UserSchema)

module.exports =  {
    UserSchema,
    User
}
