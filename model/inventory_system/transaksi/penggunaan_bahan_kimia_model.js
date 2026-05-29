const mongoose = require('mongoose')

const penggunaan_bahan_kimia_schema = new mongoose.Schema(
  {
    id_peminjam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Peminjam',
      required: true
    },
    tanggal_penggunaan: {
      type: Date,
      required: true
    },
    keperluan: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      required: true,
      enum: ['Digunakan', 'Selesai'],
      default: 'Digunakan'
    },
    catatan: {
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

penggunaan_bahan_kimia_schema.index({ id_peminjam: 1 })

module.exports = mongoose.model('PenggunaanBahanKimia', penggunaan_bahan_kimia_schema)