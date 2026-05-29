const mongoose = require('mongoose')

const pembelian_alat_schema = new mongoose.Schema(
  {
    tanggal_pengajuan: {
      type: Date,
      required: true
    },
    tanggal_diproses: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      required: true,
      enum: ['Menunggu', 'Disetujui', 'Ditolak'],
      default: 'Menunggu'
    },
    catatan: {
      type: String,
      trim: true
    },
    catatan_approve: {
      type: String,
      trim: true
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
)

pembelian_alat_schema.index({ status: 1 })
pembelian_alat_schema.index({ tanggal_pengajuan: -1 })

module.exports = mongoose.model('PembelianAlat', pembelian_alat_schema)