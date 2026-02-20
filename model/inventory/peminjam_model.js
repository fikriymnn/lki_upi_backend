const mongoose = require('mongoose')

const peminjam_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    nik: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      required: true,
      enum: ['Mahasiswa', 'Dosen', 'Staff', 'Umum']
    },
    institusi: {
      type: String,
      required: true
    },
    fakultas: {
      type: String
    },
    jurusan: {
      type: String
    },
    phone: {
      type: String,
      required: true
    },
    alamat: {
      type: String
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    jumlah_transaksi: {
      type: Number,
      default: 0,
      min: 0
    },
    jumlah_terlambat:{
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Peminjam', peminjam_schema)
