const mongoose = require('mongoose')

const detail_peminjaman_alat_schema = new mongoose.Schema(
  {
    id_peminjaman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PeminjamanAlat',
      required: true
    },
    id_alat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlatLab',
      required: true
    },
    jumlah_pinjam: {
      type: Number,
      required: true,
      min: 1
    },
    jumlah_kembali: {
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

detail_peminjaman_alat_schema.index({ id_peminjaman: 1 })
detail_peminjaman_alat_schema.index({ id_alat: 1 })

module.exports = mongoose.model('DetailPeminjamanAlat', detail_peminjaman_alat_schema)