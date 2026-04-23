const mongoose = require('mongoose')

const penyimpanan_schema = new mongoose.Schema(
  {
    penyimpanan: {
      type: String,
      required: true,
      unique: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Penyimpanan', penyimpanan_schema)
