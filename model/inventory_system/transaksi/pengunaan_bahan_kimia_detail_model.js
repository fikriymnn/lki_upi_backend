const mongoose = require('mongoose')

const detail_penggunaan_bahan_kimia_schema = new mongoose.Schema(
  {
    id_penggunaan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PenggunaanBahanKimia',
      required: true
    },
    id_bahan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BahanKimia',
      required: true
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
    }
  },
  {
    timestamps: true 
  }
)

detail_penggunaan_bahan_kimia_schema.index({ id_penggunaan: 1 })
detail_penggunaan_bahan_kimia_schema.index({ id_bahan: 1 })

module.exports = mongoose.model('DetailPenggunaanBahanKimia', detail_penggunaan_bahan_kimia_schema)