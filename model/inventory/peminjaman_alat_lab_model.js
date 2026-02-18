const mongoose = require('mongoose')

const peminjaman_alat_schema = new mongoose.Schema(
  {
    // snapshot data peminjam
    user_name: {
      type: String,
      required: true
    },
    user_nik: {
      type: String,
    },
    user_status: {
      type: String,
      required: true,
      enum: ['Mahasiswa', 'Dosen', 'Staff', 'Umum']
    },
    user_institusi: {
      type: String,
      required: true
    },
    user_fakultas: {
      type: String
    },
    user_jurusan: {
      type: String
    },
    user_phone: {
      type: String,
      required: true
    },
    user_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    // detail alat yang dipinjam (embedded)
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
      enum: ['Dipinjam', 'Dikembalikan', 'Terlambat']
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
