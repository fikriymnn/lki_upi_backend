const mongoose = require('mongoose')

const peminjaman_alat_schema = new mongoose.Schema(
  {
    id_peminjam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Peminjam',
      required: true
    },
    items: [
      {
        alat_id: {
          type: Number
        },
        nama_alat: {
          type: String,
          required: true
        },
        spesifikasi: {
          type: String
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
        }
      }
    ],

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
    },

    keperluan: {
      type: String
    },

    catatan_pengembalian: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('PeminjamanAlat', peminjaman_alat_schema)
