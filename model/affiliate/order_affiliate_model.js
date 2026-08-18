const mongoose = require("mongoose");
const objId = mongoose.Schema.Types.ObjectId;

// ---------- Subdocument: Layanan Analisis ----------
const layanan_analisis_schema = new mongoose.Schema({
    jenis_layanan: {
        type: [String], // langsung berisi nama layanan yang dicentang, mis. ["Autoklaf", "Shaker"]
    },
    nama_sample: {
        type: String,
    },
    pelarut: {
        type: String,
    },
    jumlah_sample: {
        type: Number,
    },
    metode_parameter: {
        type: String,
    },
    foto_sample: {
        type: String,
    },
    jurnal_pendukung: {
        type: String,
    },
    keterangan: {
        type: String,
    },
    harga_satuan: {
        type: Number, // diisi manual oleh admin
    },
    total: {
        type: Number, // diisi manual oleh admin
    },
});

// ---------- Subdocument: Sewa Lab ----------
const sewa_lab_schema = new mongoose.Schema({
    jenis_sewa: {
        type: String, // Hari / Bulan
    },
    tanggal_mulai: {
        type: Date,
    },
    tanggal_selesai: {
        type: Date,
    },
    jenis_sewa: {
        type: String,
    },
    jumlah: {
        type: Number,
    },
    keterangan: {
        type: String,
    },
    harga_satuan: {
        type: Number, // diisi manual oleh admin
    },
    total: {
        type: Number, // diisi manual oleh admin
    },
});

// ---------- Subdocument: Sewa Alat ----------
const sewa_alat_schema = new mongoose.Schema({
    nama_alat: {
        type: String, // mis. Shaker, Furnace, Autoklaf — beda dari sewa lab karena harga bergantung alatnya
    },
    jenis_sewa: {
        type: String, // Hari / Jam / Bulan
    },
    tanggal_mulai: {
        type: Date,
    },
    tanggal_selesai: {
        type: Date,
    },
    jumlah: {
        type: Number,
    },
    keterangan: {
        type: String,
    },
    harga_satuan: {
        type: Number, // diisi manual oleh admin
    },
    total: {
        type: Number, // diisi manual oleh admin
    },
});

// ---------- Subdocument: Pembelian Bahan ----------
const pembelian_bahan_schema = new mongoose.Schema({
    jenis_bahan: {
        type: String,
    },
    satuan: {
        type: String,
    },
    keterangan: {
        type: String,
    },
    harga_satuan: {
        type: Number, // diisi manual oleh admin
    },
    total: {
        type: Number, // diisi manual oleh admin
    },
});

const order_affiliate_schema = new mongoose.Schema(
    {
        id_affiliate: {
            type: objId,
            ref: "LabAffiliate",
            required: true,
        },
        id_user: {
            type: objId,
            ref: "User",
            required: true,
        },
        no_invoice: {
            type: String,
        },
        date: {
            type: Date,
            default: new Date().toISOString(),
        },
        year: {
            type: String,
            default: new Date().getFullYear().toString(),
        },
        month: {
            type: String,
            default: new Date().getMonth().toString(),
        },
        status_pengujian: {
            type: String,
        },

        // ── Snapshot dari User (di-copy otomatis saat order dibuat, sesuai model User) ──
        nama_lengkap: {
            type: String,
        },
        email: {
            type: String,
        },
        no_telp: {
            type: String,
        },
        no_whatsapp: {
            type: String,
        },
        jenis_institusi: {
            type: String,
        },
        nama_institusi: {
            type: String,
        },
        program_studi: {
            type: String,
        },
        fakultas: {
            type: String,
        },

        // ── Field khusus order lab, tidak ada di model User ──
        nama_pembimbing: {
            type: String,
        },

        // Keempat jenis layanan — masing-masing opsional, minimal salah satu wajib diisi
        layanan_analisis: {
            type: [layanan_analisis_schema],
            default: [],
        },
        sewa_lab: {
            type: [sewa_lab_schema],
            default: [],
        },
        sewa_alat: {
            type: [sewa_alat_schema],
            default: [],
        },
        pembelian_bahan: {
            type: [pembelian_bahan_schema],
            default: [],
        },

        total_keseluruhan: {
            type: Number, // diisi manual oleh admin
        },
        bukti_pembayaran: {
            type: String, // path/URL file bukti transfer yang diupload user
        },
        laporan: {
            type: String, // path/URL file bukti transfer yang diupload laboran
        },
        rincian_biaya: {
            type: String, // path/URL file rincian biaya yang diupload laboran
        },
        hasil_analisis: {
            type: String, // path/URL file rincian biaya yang diupload laboran
        },
        syarat_ketentuan: {
            type: Boolean,
            default: false,
        },
        rincian_harga_invoice: {
            type: [
                {
                    tanggal: { type: Date },
                    deskripsi: { type: String },
                    keterangan: { type: String },
                    jumlah: { type: Number },
                    satuan: { type: String },
                    harga_satuan: { type: Number },
                    total: { type: Number },
                }
            ],
            default: [],
        },

    },
    { timestamps: true }
);

order_affiliate_schema.pre("validate", function (next) {
    const ada_layanan =
        (this.layanan_analisis && this.layanan_analisis.length > 0) ||
        (this.sewa_lab && this.sewa_lab.length > 0) ||
        (this.sewa_alat && this.sewa_alat.length > 0) ||
        (this.pembelian_bahan && this.pembelian_bahan.length > 0);

    if (!ada_layanan) {
        return next(new Error("Minimal salah satu layanan harus diisi"));
    }
    next();
});

module.exports = mongoose.model("OrderAffiliate", order_affiliate_schema);