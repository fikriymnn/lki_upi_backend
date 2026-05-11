require("dotenv").config({ path: "config.env" });
const path = require("path")
const express = require('express')
const body_parser = require('body-parser')
const cookie_parser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()

const URL = process.env.DATABASE_URL
const PORT = process.env.PORT || 5000

const corsOptions = {
  origin: [
    'https://lki-upi.vercel.app',         // ✅ domain frontend production
    'http://localhost:3000',               // ✅ local development
  ],
  credentials: true,                       // ✅ wajib untuk cookie
  exposedHeaders: 'Content-Disposition',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

// ✅ Urutan benar: cookie parser → cors → body parser → routes
app.use(cookie_parser())
app.use(cors(corsOptions))
app.use(body_parser.json())
app.use(body_parser.urlencoded({ extended: true }))

async function start() {
  try {
    mongoose.connect(URL)
  } catch(err) {
    console.log(err.message)
  }

  app.use("/api", require('./routes/router'))
  app.use('/file', express.static(path.join(__dirname, 'file')))
  app.use("/", (req, res) => {
    res.send("success")
  })

  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch(err) {
    console.log(err.message)
  }
}

start()
module.exports = app