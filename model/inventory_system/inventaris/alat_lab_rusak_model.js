const mongoose = require('mongoose')

const alat_lab_rusak_schema = new mongoose.Schema(
  {
    id_peminjaman_alat_lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PeminjamanAlatLab',
      required: true
    },
    id_alat_lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlatLab',
      required: true
    },
    id_peminjam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Peminjam',
      required: true
    },
    status_penggantian: {
      type: String,
      enum: ['Belum Diganti', 'Sudah Diganti'],
      default: 'Belum Diganti'
    },
    tanggal_diganti: {
      type: Date
    },
    catatan_penggantian: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('AlatLabRusak', alat_lab_rusak_schema)
