const express = require('express')
const body_parser = require('body-parser')
const cookie_parser = require('cookie-parser')
const mongoose = require('mongoose')
const URL = process.env.DATABASE_URL
const PORT = process.env.PORT || 5000
const app = express()
const router = express.Router()

app.use(body_parser.json())
app.use(body_parser.urlencoded({extended:true}))
app.use(cookie_parser())

app.use("/api/",require('./routes/router'))

    // mongoose.connect(`${URL}`)
app.listen(PORT)
