require('dotenv').config({path: `.env.${process.env.NODE_ENV}`})
const express = require('express')

const app = express()
const port = parseInt(process.env.port)

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})