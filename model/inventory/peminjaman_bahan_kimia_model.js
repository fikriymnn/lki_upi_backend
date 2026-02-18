const mongoose = require('mongoose')

const peminjaman_bahan_schema = new mongoose.Schema(
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

    // detail bahan yang dipinjam (embedded)
    items: [
      {
        bahan_id: {
          type: Number
        },
        nama_bahan: {
          type: String,
          required: true
        },
        rumus_kimia: {
          type: String
        },
        jumlah_pinjam: {
          type: Number,
          required: true,
          min: 0
        },
        jumlah_kembali: {
          type: Number,
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
      type: Date
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

module.exports = mongoose.model('PeminjamanBahan', peminjaman_bahan_schema)
