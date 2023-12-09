const express = require('express')
const body_parser = require('body-parser')
const cookie_parser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const URL = process.env.DATABASE_URL
const PORT = process.env.PORT || 5000


app.use(cors({credentials: true, origin: true }))
app.use(body_parser.json())
app.use(body_parser.urlencoded({extended:true}))
app.use(cookie_parser())
app.use("/api",require('./routes/router'))

mongoose.connect(URL)
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})
