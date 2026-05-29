const mongoose = require('mongoose')

const peminjaman_alat_schema = new mongoose.Schema(
  {
    id_peminjam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Peminjam',
      required: true
    },
    tanggal_pinjam: {
      type: Date,
      required: true
    },
    tanggal_kembali: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['Dipinjam', 'Dikembalikan', 'Terlambat', 'Sebagian Dikembalikan'],
      default: 'Dipinjam'
    },
    keperluan: {
      type: String,
      trim: true
    },
    catatan_pengembalian: {
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

peminjaman_alat_schema.index({ id_peminjam: 1 })

module.exports = mongoose.model('PeminjamanAlat', peminjaman_alat_schema)