const mongoose = require('mongoose')

const alat_lab_schema = new mongoose.Schema(
  {
    nama_alat: {
      type: String,
      required: true,
      trim: true
    },
    spesifikasi: {
      type: String
    },
    jumlah: {
      type: Number,
      required: true,
      min: 0
    },
    merk_brand: {
      type: String
    },
    suppliers: [
      {
        nama_supplier: {
          type: String,
          required: true
        },
        alamat: {
          type: String
        },
        no_wa: {
          type: String
        }
      }
    ],
    penyimpanan: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('AlatLab', alat_lab_schema)
