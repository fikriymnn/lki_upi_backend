const mongoose = require('mongoose')

const stock_in_schema = new mongoose.Schema(
  {
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'item_model'
    },
    item_model: {
      type: String,
      required: true,
      enum: ['AlatLab', 'BahanKimia']
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    spesifikasi: {
      type: String,
      trim: true
    },
    deskripsi: {
      type: String,
      trim: true
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('StockIn', stock_in_schema)