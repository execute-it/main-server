module.exports = function timestamp(schema) {

    schema.add({
        createdAt: Date
    })

    schema.pre('save', function (next) {
        let now = Date.now()

        if (!this.createdAt) {
            this.createdAt = now
        }
        next()
    })
}