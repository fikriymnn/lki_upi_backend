const mongoose = require('mongoose')

const stock_opname_schema = new mongoose.Schema(
  {
    tanggal: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'FINAL'],
      default: 'DRAFT'
    },
    dibuat_oleh: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    disesuaikan_oleh: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    disesuaikan_pada: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('StockOpname', stock_opname_schema)