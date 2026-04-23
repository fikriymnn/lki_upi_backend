const mongoose = require('mongoose')

const peminjaman_bahan_schema = new mongoose.Schema(
  {
    // Data Peminjam
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Peminjam',
      default: null
    },
    user_name: {
      type: String,
      required: true,
      trim: true
    },
    user_nik: {
      type: String,
      required: true
    },
    user_status: {
      type: String,
      required: true,
      enum: ['Mahasiswa', 'Dosen', 'Staff', 'Peneliti', 'Umum']
    },
    user_institusi: {
      type: String,
      required: true
    },
    user_fakultas: {
      type: String,
      default: ''
    },
    user_jurusan: {
      type: String,
      default: ''
    },
    user_phone: {
      type: String,
      required: true
    },
    user_email: {
      type: String,
    },
    user_alamat: {
      type: String,
      default: ''
    },

    // Bahan yang dipinjam
    items: [
      {
        bahan_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'BahanKimia',
          required: true
        },
        nama_bahan: {
          type: String,
          required: true
        },
        rumus_kimia: {
          type: String,
          default: ''
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
        },
        satuan: {
          type: String,
          required: true
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
    tanggal_dikembalikan: {
      type: Date,
      default: null
    },

    keperluan: {
      type: String,
      required: true
    },

    // Hanya 2 status: Dipinjam atau Dikembalikan
    status: {
      type: String,
      enum: ['Dipinjam', 'Dikembalikan'],
      default: 'Dipinjam'
    },

    catatan_pengembalian: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('PeminjamanBahan', peminjaman_bahan_schema)