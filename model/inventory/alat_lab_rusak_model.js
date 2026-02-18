const mongoose = require('mongoose')

const alat_lab_rusak_schema = new mongoose.Schema(
  {
    // ===== snapshot data alat lab =====
    nama_alat: {
      type: String,
      required: true,
      trim: true
    },
    spesifikasi: {
      type: String
    },
    merk_brand: {
      type: String
    },
    penyimpanan: {
      type: String,
      required: true
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

    // ===== snapshot data peminjam =====
    user_name: {
      type: String,
      required: true
    },
    user_nik: {
      type: String,
      required: true
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
    user_alamat: {
      type: String
    },
    user_email: {
      type: String,
      lowercase: true,
      trim: true
    },

    // ===== informasi kerusakan =====
    jumlah_rusak: {
      type: Number,
      required: true,
      min: 1
    },
    deskripsi_kerusakan: {
      type: String
    },

    // ===== status penggantian =====
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
