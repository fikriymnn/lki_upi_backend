const mongoose = require("mongoose");
const objId = mongoose.Schema.Types.ObjectId;

const tarif_schema = new mongoose.Schema({
  segmen: {
    type: String, // "Internal UPI" | "Eksternal"
  },
  golongan: {
    type: String,
  },
  varian: {
    type: String,
  },
  jenis_jasa: {
    type: String,
  },
  harga: {
    type: Number,
  },
});

const catalog_schema = new mongoose.Schema(
  {
    id_affiliate: {
      type: objId,
      ref: "LabAffiliate",
      required: true,
    },
    // Diskriminator yang menentukan kolom apa saja yang relevan
    // ditampilkan di FE (lihat FIELD_CONFIG di halaman detail katalog).
    // Wajib salah satu dari 4 tipe layanan yang saat ini didukung FE.
    tipe_layanan: {
      type: String,
      enum: ["sewa_alat", "sewa_lab", "layanan_analisis", "pembelian_bahan"],
      required: true,
    },
    sub_kategori: {
      type: String,
    },
    nama_item: {
      type: String,
      required: true,
    },
    deskripsi: {
      type: String,
    },
    metode_analisis: {
      type: String,
    },
    satuan: {
      type: String,
    },
    jumlah_minimal_sampel: {
      type: String,
    },
    keterangan: {
      type: String,
    },
    tarif: [tarif_schema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Catalog", catalog_schema);