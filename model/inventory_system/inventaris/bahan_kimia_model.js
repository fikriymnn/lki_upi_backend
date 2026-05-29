const mongoose = require('mongoose')

const bahan_kimia_schema = new mongoose.Schema(
  {
    nama_bahan: {
      type: String,
      required: true,
      trim: true
    },
    rumus_kimia: {
      type: String,
      required: true,
      trim: true
    },
    spesifikasi: {
      type: String,
      trim: true
    },
    jenis_bahan: {
      type: String,
      required: true,
      enum: ['larutan', 'padatan']
    },
    jumlah: {
      type: Number,
      required: true,
      min: 0
    },
    satuan: {
      type: String,
      required: true,
      enum: ['mL', 'g']
    },
    merk: {
      type: String,
      trim: true
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
    id_penyimpanan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Penyimpanan',
      required: true
    },
    tanggal_kadaluarsa: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('BahanKimia', bahan_kimia_schema)