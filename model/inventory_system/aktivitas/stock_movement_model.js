const mongoose = require('mongoose')

const stock_movement_schema = new mongoose.Schema(
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
    id_penyimpanan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Penyimpanan',
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['IN', 'OUT', 'ADJUSTMENT']
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    previous_stock: {
      type: Number,
      required: true,
      min: 0
    },
    new_stock: {
      type: Number,
      required: true,
      min: 0
    },
    deskripsi: {
      type: String,
      trim: true
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

stock_movement_schema.index({ item_id: 1, createdAt: -1 })

module.exports = mongoose.model('StockMovement', stock_movement_schema)