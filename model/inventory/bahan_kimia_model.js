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
      trim: true
    },
    spesifikasi: {
      type: String
    },
    jenis_bahan: {
      type: String,
      required: true,
      enum: ['larutan', 'padat', 'gas']
    },

    // input awal / pembelian
    jumlah_input: {
      type: Number,
      required: true,
      min: 0
    },
    satuan_input: {
      type: String,
      required: true
    },

    // stok berjalan
    jumlah: {
      type: Number,
      required: true,
      min: 0
    },
    satuan: {
      type: String,
      required: true
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
    },

    tanggal_kadaluarsa: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('BahanKimia', bahan_kimia_schema)
