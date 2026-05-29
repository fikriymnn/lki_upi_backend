const mongoose = require('mongoose')

const detail_praktikum_schema = new mongoose.Schema(
  {
    id_praktikum: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Praktikum',
      required: true
    },
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
    jumlah_digunakan: {
      type: Number,
      required: true,
      min: 1
    },
    jumlah_dikembalikan: {
      type: Number,
      default: 0,
      min: 0
    },
    jumlah_rusak: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
)

detail_praktikum_schema.index({ id_praktikum: 1 })
detail_praktikum_schema.index({ item_id: 1 })

module.exports = mongoose.model('DetailPraktikum', detail_praktikum_schema)