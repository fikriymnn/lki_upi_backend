const mongoose = require('mongoose')

const praktikum_schema = new mongoose.Schema(
  {
    judul: {
      type: String,
      required: true,
      trim: true
    },
    deskripsi: {
      type: String,
      trim: true
    },
    tanggal: {
      type: Date,
      required: true
    },
    tanggal_selesai: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      required: true,
      enum: ['Berlangsung', 'Selesai'],
      default: 'Berlangsung'
    },
    id_penanggungjawab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Peminjam',
      required: true
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

module.exports = mongoose.model('Praktikum', praktikum_schema)